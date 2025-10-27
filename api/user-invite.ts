import { createClerkClient, verifyToken } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { email, userRole, subscriptionDuration } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  if (!userRole) return res.status(400).json({ message: 'User role required' });
  if (!subscriptionDuration)
    return res.status(400).json({ message: 'Subscription duration required' });

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    const user = await clerkClient.users.getUser(payload.sub);

    if (user.publicMetadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Calculate expiration date based on subscription duration
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + subscriptionDuration * 24 * 60 * 60 * 1000,
    );

    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.BASE_URL}sign-up`,
      notify: true,
      publicMetadata: {
        role: userRole,
        expiresAt: expiresAt.toISOString(),
      },
    });

    res.status(200).json({ success: true, invitation });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err.errors[0].longMessage);
    res.status(500).json({
      message: err.errors[0].longMessage ?? 'Failed to create invitation',
    });
  }
}
