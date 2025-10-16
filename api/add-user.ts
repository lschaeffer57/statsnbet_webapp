import crypto from 'crypto';

import { createClerkClient } from '@clerk/backend';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

import type {
  CreateUserRequest,
  TelegramUser,
  UserDocument,
} from '../src/types';

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

const parseNumericValue = (value: string): number => {
  const cleanedValue = value.replace(/[^\d.,-]/g, '');
  const normalizedValue = cleanedValue.replace(',', '.');
  return parseFloat(normalizedValue);
};

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

  try {
    await client.connect();

    const {
      clerkId,
      email,
      username,
      performanceParameters,
      telegram,
    }: CreateUserRequest = req.body;

    if (telegram && !telegramBotToken) {
      return res.status(400).json({ error: 'Telegram bot token is not set' });
    }

    if (!clerkId || !email || !username || !performanceParameters) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clerkId', 'email', 'username', 'performanceParameters'],
      });
    }

    if (typeof clerkId !== 'string' || clerkId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid clerkId' });
    }

    if (telegram && !verifyTelegramAuth(telegram, telegramBotToken!)) {
      return res.status(400).json({ error: 'Invalid Telegram data' });
    }

    const getBotActivateStatus = async (): Promise<{ ok: boolean }> => {
      const res = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChat?chat_id=${telegram?.id}`,
      );
      return res.json();
    };

    const botActivated = await getBotActivateStatus();
    const isBotActivated = botActivated.ok;

    const evMin = parseNumericValue(performanceParameters.evMin);
    const trj = parseNumericValue(performanceParameters.trj);
    const minCost = parseNumericValue(performanceParameters.minCost);
    const maxCost = parseNumericValue(performanceParameters.maxCost);
    const minLiquidity = parseNumericValue(performanceParameters.minLiquidity);
    const bankroll = parseNumericValue(performanceParameters.bankroll);

    if (
      isNaN(evMin) ||
      isNaN(trj) ||
      isNaN(minCost) ||
      isNaN(maxCost) ||
      isNaN(minLiquidity) ||
      isNaN(bankroll)
    ) {
      return res.status(400).json({
        error: 'Invalid numeric values in performance parameters',
        details: 'All numeric fields must be valid numbers',
      });
    }

    const db = client.db('Client_Data');
    const collectionName = clerkId;

    const existingUser = await db
      .collection(collectionName)
      .findOne({ clerk_id: clerkId });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: `User with clerkId ${clerkId} already exists`,
      });
    }

    const clerkUser = await clerkClient.users.getUser(clerkId);
    console.log(clerkUser);
    const expiresAtFromMetadata = clerkUser.publicMetadata?.expiresAt as
      | string
      | undefined;

    if (!expiresAtFromMetadata) {
      return res.status(400).json({
        error:
          'User has no active subscription. Please use a valid invitation link.',
      });
    }

    const userDocument: UserDocument = {
      clerk_id: clerkId,
      email,
      username: username,
      ...(telegram && { telegram }),
      bot_activated: isBotActivated,
      ev_min_pct: evMin,
      trj_pct: trj,
      odds: {
        min: minCost,
        max: maxCost,
      },
      min_liquidity: minLiquidity,
      send_window: {
        start: performanceParameters.time.start,
        end: performanceParameters.time.end,
      },
      bet_types: performanceParameters.betType,
      sports: performanceParameters.sport,
      markets: performanceParameters.market,
      bookmakers: performanceParameters.bookmaker,
      bankroll_reference: bankroll,
      created_at: new Date(),
      updated_at: new Date(),
      bankroll_current: null,
      subscription: {
        active: true,
        begin: new Date(),
        end: new Date(expiresAtFromMetadata),
      },
    };

    const result = await db.collection(collectionName).insertOne(userDocument);

    if (!result.insertedId) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertedId,
        clerk_id: clerkId,
        email,
        username,
        collectionName,
        created_at: userDocument.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
