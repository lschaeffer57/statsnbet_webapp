import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

import { BOOKMAKER_GROUPS } from './src/constants/bookmakerGroups';

dotenv.config({ path: '.env.local' });

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/';

async function seedBookmakers() {
  console.log(`🔌 Connecting to ${URI}...`);
  const client = new MongoClient(URI);

  try {
    await client.connect();
    const db = client.db('Bookmaker');

    console.log('📦 preparing to seed bookmakers...');

    // Flatten the groups into a single list of bookmakers
    const allBookmakers = Object.values(BOOKMAKER_GROUPS).flat();

    let createdCount = 0;

    for (const name of allBookmakers) {
      // The collection name usually matches the bookmaker name in your architecture
      // We normalize to lowercase for collision check but keep display name
      const collectionName = name;

      // Check if collection exists
      const collections = await db
        .listCollections({ name: collectionName })
        .toArray();

      if (collections.length === 0) {
        // Create the collection and insert a metadata document
        await db.collection(collectionName).insertOne({
          original: name,
          cloneName: name, // Important for the UI to match
          users: Math.floor(Math.random() * 50), // Mock user count
          running: true,
        });
        process.stdout.write(`+`); // Progress indicator
        createdCount++;
      } else {
        process.stdout.write(`.`); // Skipped
      }
    }

    console.log(`\n\n✅ Seeding complete!`);
    console.log(`   - Total processed: ${allBookmakers.length}`);
    console.log(`   - Newly created: ${createdCount}`);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedBookmakers();
