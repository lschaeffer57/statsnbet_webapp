import crypto from 'crypto';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

import type { TelegramUser } from '../src/types';

function verifyTelegramAuth(data: TelegramUser, botToken: string) {
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${data[key as keyof TelegramUser]}`)
    .join('\n');

  const hash = crypto
    .createHmac('sha256', secret)
    .update(checkString)
    .digest('hex');
  return hash === data.hash;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { telegramUser, userId } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: 'Telegram bot token is not set' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  if (!telegramUser || !userId) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['telegramUser', 'userId'],
    });
  }

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

  const client = new MongoClient(process.env.MONGODB_URI);

  if (!verifyTelegramAuth(telegramUser, telegramBotToken)) {
    return res.status(400).json({ error: 'Invalid Telegram data' });
  }

  const getBotActivateStatus = async (): Promise<{ ok: boolean }> => {
    const res = await fetch(
      `https://api.telegram.org/bot${telegramBotToken}/getChat?chat_id=${telegramUser.id}`,
    );
    return res.json();
  };

  const botActivated = await getBotActivateStatus();
  const isBotActivated = botActivated.ok;

  try {
    await client.connect();

    const db = client.db('Client_Data');
    const collectionName = userId;

    const result = await db.collection(collectionName).updateOne(
      { clerk_id: userId },
      {
        $set: { telegram: telegramUser, bot_activated: isBotActivated },
      },
      { upsert: true },
    );

    if (!result.acknowledged) {
      return res.status(500).json({ error: 'Failed to save Telegram data' });
    }

    res.status(200).json({
      success: true,
      message: 'Telegram account connected successfully',
      data: {
        userId,
        connectedAt: telegramUser.auth_date,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to connect Telegram account' });
  } finally {
    await client.close();
  }
}
