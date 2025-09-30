import {
  MongoClient,
  Collection,
  AnyBulkWriteOperation,
  BulkWriteResult,
} from 'mongodb';

interface BetDocument {
  _id: string;
  stake?: number;
  ev?: number;
  theoretical_gain?: number;
  match?: string;
  bet?: string | object;
  date?: string;
  bookmaker?: string;
  sport?: string;
  type?: string;
  odds?: number;
  market?: string;
  fair_odds?: number;
  competition?: string;
  payout_rate?: number;
  liquidity?: number;
  status?: string;
  result?: string | null;
  user_id: number;
  sent_at: string;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function updateBetsWithTheoreticalGain(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('bilan');
    const collection: Collection<BetDocument> =
      db.collection<BetDocument>('Bilan');

    const totalCount = await collection.countDocuments();
    console.log(`Total bets to process: ${totalCount}`);

    let processedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const batchSize = 1000;
    let skip = 0;

    while (skip < totalCount) {
      const currentBatchEnd = Math.min(skip + batchSize, totalCount);
      console.log(`Processing batch: ${skip + 1} to ${currentBatchEnd}`);

      const bets: BetDocument[] = await collection
        .find({})
        .skip(skip)
        .limit(batchSize)
        .toArray();

      if (bets.length === 0) {
        console.log('No more bets to process');
        break;
      }

      const bulkOps: AnyBulkWriteOperation<BetDocument>[] = [];

      for (const bet of bets) {
        processedCount++;

        if (bet.theoretical_gain !== undefined) {
          skippedCount++;
          continue;
        }

        if (
          bet.stake === undefined ||
          bet.stake === null ||
          bet.ev === undefined ||
          bet.ev === null
        ) {
          console.log(`Skipping bet ${bet._id}: missing stake or ev field`);
          skippedCount++;
          continue;
        }

        const theoreticalGain = (bet.stake / 100) * bet.ev;

        bulkOps.push({
          updateOne: {
            filter: { _id: bet._id },
            update: {
              $set: {
                theoretical_gain: theoreticalGain,
              },
            },
          },
        });
      }

      if (bulkOps.length > 0) {
        const result: BulkWriteResult = await collection.bulkWrite(bulkOps);
        updatedCount += result.modifiedCount;
        console.log(`Updated ${result.modifiedCount} bets in this batch`);
      }

      skip += batchSize;
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total bets processed: ${processedCount}`);
    console.log(`Bets updated: ${updatedCount}`);
    console.log(`Bets skipped: ${skippedCount}`);
    console.log('Update completed successfully!');
  } catch (error) {
    console.error('Error updating bets:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  updateBetsWithTheoreticalGain()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { updateBetsWithTheoreticalGain };
