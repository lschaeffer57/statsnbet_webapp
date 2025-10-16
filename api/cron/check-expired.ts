import { createClerkClient, User } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

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

  let changedCount = 0;

  for (const user of allUsers) {
    const expiresAt = user.publicMetadata?.expiresAt as string;
    if (expiresAt && new Date(expiresAt) < new Date()) {
      try {
        await client.connect();

        const db = client.db('Client_Data');
        await db
          .collection(user.id)
          .updateOne(
            { clerk_id: user.id },
            { $set: { 'subscription.active': false, updated_at: new Date() } },
          );
      } catch (err) {
        console.error(`Failed to update subscription for ${user.id}:`, err);
      } finally {
        await client.close();
      }

      changedCount++;
    }
  }

  res
    .status(200)
    .json({ checked: allUsers.length, changedCount, success: true });
}
