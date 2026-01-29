import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();
dotenv.config({ path: '.env.local' });

// Use your specific Clerk ID from the screenshot
const CLERK_ID = 'user_38veDv6HcFST16OdHfA6MSH5Dlo';
const URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/';

async function seed() {
  console.log(`🔌 Connecting to ${URI}...`);
  const client = new MongoClient(URI);

  try {
    await client.connect();
    const db = client.db('Client_Data');

    // 1. Check if user already exists
    const existing = await db
      .collection(CLERK_ID)
      .findOne({ clerk_id: CLERK_ID });

    if (existing) {
      console.log(`⚠️ User ${CLERK_ID} already exists. Skipping.`);
    } else {
      // 2. Create the User Profile
      const userDoc = {
        clerk_id: CLERK_ID,
        email: 'local-admin@statsnbet.io',
        username: 'LocalAdmin',
        active_config: true,
        config_number: 1,
        ev_min_pct: 1,
        trj_pct: 99,
        odds: { min: 1.3, max: 4 },
        min_liquidity: 500,
        send_window: { start: '00:00', end: '23:59' },
        bet_types: { live: true, prematch: true },
        sports: ['Football', 'Tennis', 'Basketball'],
        percentage: false,
        markets: {
          moneyline: true,
          over_under: true,
          handicap: true,
          player_performance: true,
        },
        bookmakers: ['1xbet', 'pinnacle', 'bet365'], // Default bookies
        bankroll_reference: 1000,
        created_at: new Date(),
        updated_at: new Date(),
        bankroll_current: null,
        subscription: {
          active: true,
          begin: new Date(),
          end: new Date('2030-01-01'), // Long expiry for dev
        },
      };

      // MongoDB requires the collection to be named after the Clerk ID for your architecture
      await db.collection(CLERK_ID).insertOne(userDoc);
      console.log(`✅ User ${CLERK_ID} created successfully!`);
    }

    // 3. Seed Dummy Bookmakers (So the dropdown isn't empty)
    const bookmakerDb = client.db('Bookmaker');
    const bookies = ['1xbet', 'pinnacle', 'bet365', '4kasino', 'amunra'];

    for (const name of bookies) {
      // Check if collection exists implicitly by trying to count
      const count = await bookmakerDb.collection(name).countDocuments();
      if (count === 0) {
        await bookmakerDb.collection(name).insertOne({
          original: name,
          cloneName: name,
          users: 0,
          running: true,
        });
        console.log(`   + Created bookmaker: ${name}`);
      }
    }
    console.log('✅ Bookmakers seeded.');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
