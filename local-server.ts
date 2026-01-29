import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

// --- IMPORT API HANDLERS ---
// We import these directly so tsx compiles them correctly
import addConfigHandler from './api/add-config';
import addTelegramHandler from './api/add-telegram';
import addUserHandler from './api/add-user';
import betsHandler from './api/bets';
import bookmakersHandler from './api/bookmakers';
import courseHandler from './api/course';
import deleteConfigHandler from './api/delete-config';
import deleteTelegramHandler from './api/delete-telegram';
import filterDashboardHandler from './api/filter-dashboard';
import filterHistoryHandler from './api/filter-history';
import getUserHandler from './api/get-user';
import recentBetsHandler from './api/recent-bets';
import switchConfigHandler from './api/switch-config';
import updateConfigHandler from './api/update-config';
import userBetsHandler from './api/user-bets';
import userInviteHandler from './api/user-invite';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- LOGGER MIDDLEWARE ---
app.use((req, res, next) => {
  const start = Date.now();
  console.log(
    `[${new Date().toLocaleTimeString()}] ➤ ${req.method} ${req.url}`,
  );

  // Hook into response to log status code
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for error, Green for success
    const reset = '\x1b[0m';
    console.log(
      `[${new Date().toLocaleTimeString()}] ${color}DONE ${status}${reset} (${duration}ms)`,
    );
    return originalSend.call(this, body);
  };

  next();
});

// --- VERCEL MOCK ADAPTER ---
// Wraps Express req/res to match Vercel's serverless signature
// Vercel handlers expect VercelRequest/VercelResponse but work with Express types at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapt = (handler: any) => {
  return async (req: Request, res: Response) => {
    try {
      // Type assertion: Express Request/Response are compatible enough with Vercel types at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await handler(req as any, res as any);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ API Error:', errorMessage);
      if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
      }
    }
  };
};

// --- ROUTES ---
// Map your API files to local Express routes
app.get('/api/bookmakers', adapt(bookmakersHandler));
app.get('/api/user-bets', adapt(userBetsHandler));
app.get('/api/recent-bets', adapt(recentBetsHandler));
app.get('/api/bets', adapt(betsHandler));

app.post('/api/add-telegram', adapt(addTelegramHandler));
app.delete('/api/delete-telegram', adapt(deleteTelegramHandler));

app.post('/api/add-user', adapt(addUserHandler));
app.post('/api/add-config', adapt(addConfigHandler));
app.put('/api/switch-config', adapt(switchConfigHandler));
app.put('/api/update-config', adapt(updateConfigHandler));
app.delete('/api/delete-config', adapt(deleteConfigHandler));

app.get('/api/get-user', adapt(getUserHandler));
app.get('/api/filter-history', adapt(filterHistoryHandler));
app.get('/api/filter-dashboard', adapt(filterDashboardHandler));
app.get('/api/course', adapt(courseHandler));

app.post('/api/user-invite', adapt(userInviteHandler));

// --- START SERVER ---
app.listen(PORT, '127.0.0.1', () => {
  console.log(`
  ┌──────────────────────────────────────────────────┐
  │  🚀 LOCAL API SERVER READY                       │
  │  📡 URL: http://127.0.0.1:${PORT}                │
  │  💾 DB:  ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Undefined'} │
  └──────────────────────────────────────────────────┘
  `);
});
