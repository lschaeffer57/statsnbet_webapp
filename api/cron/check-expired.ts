import { createClerkClient, User } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let allUsers: User[] = [];
  let offset = 0;
  const limit = 500;

  while (true) {
    const users = await clerkClient.users.getUserList({
      limit,
      offset,
    });

    allUsers = allUsers.concat(users.data);

    if (users.data.length < limit) break;
    offset += limit;
  }

  let bannedCount = 0;

  for (const user of allUsers) {
    const expiresAt = user.publicMetadata?.expiresAt as string;
    if (expiresAt && new Date(expiresAt) < new Date()) {
      const sessionsResp = await clerkClient.sessions.getSessionList({
        userId: user.id,
        limit: 1000,
      });

      await Promise.allSettled(
        sessionsResp.data.map((s) => clerkClient.sessions.revokeSession(s.id)),
      );

      await clerkClient.users.lockUser(user.id);
      bannedCount++;
    }
  }

  res
    .status(200)
    .json({ checked: allUsers.length, bannedCount, success: true });
}
