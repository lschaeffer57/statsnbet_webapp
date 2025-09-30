import {
  MongoClient,
  Collection,
  AnyBulkWriteOperation,
  BulkWriteResult,
  Db,
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

async function updateUserHistoryWithTheoreticalGain(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db: Db = client.db('userhistory');

    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} user collections to process`);

    let totalProcessedCount = 0;
    let totalUpdatedCount = 0;
    let totalSkippedCount = 0;
    let processedCollections = 0;

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\n=== Processing collection: ${collectionName} ===`);

      const collection: Collection<BetDocument> =
        db.collection<BetDocument>(collectionName);

      const totalCount = await collection.countDocuments();
      console.log(`Total bets in ${collectionName}: ${totalCount}`);

      if (totalCount === 0) {
        console.log(`Skipping empty collection: ${collectionName}`);
        continue;
      }

      let processedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      const batchSize = 1000;
      let skip = 0;

      while (skip < totalCount) {
        const currentBatchEnd = Math.min(skip + batchSize, totalCount);
        console.log(
          `Processing batch: ${skip + 1} to ${currentBatchEnd} in ${collectionName}`,
        );

        const bets: BetDocument[] = await collection
          .find({})
          .skip(skip)
          .limit(batchSize)
          .toArray();

        if (bets.length === 0) {
          console.log(`No more bets to process in ${collectionName}`);
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

      console.log(`\n=== Summary for ${collectionName} ===`);
      console.log(`Bets processed: ${processedCount}`);
      console.log(`Bets updated: ${updatedCount}`);
      console.log(`Bets skipped: ${skippedCount}`);

      totalProcessedCount += processedCount;
      totalUpdatedCount += updatedCount;
      totalSkippedCount += skippedCount;
      processedCollections++;
    }

    console.log('\n=== Final Update Summary ===');
    console.log(`Collections processed: ${processedCollections}`);
    console.log(`Total bets processed: ${totalProcessedCount}`);
    console.log(`Total bets updated: ${totalUpdatedCount}`);
    console.log(`Total bets skipped: ${totalSkippedCount}`);
    console.log('User history update completed successfully!');
  } catch (error) {
    console.error('Error updating user history:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  updateUserHistoryWithTheoreticalGain()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { updateUserHistoryWithTheoreticalGain };
