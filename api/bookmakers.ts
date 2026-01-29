import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(_: VercelRequest, res: VercelResponse) {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('Bookmaker');

    // 1. Get all collection names efficiently
    const collections = await db.listCollections().toArray();

    // 2. Use Promise.all to fetch metadata in parallel, but handle failures gracefully
    // We only need specific fields to keep it light
    const bookmakerData = await Promise.all(
      collections.map(async (col) => {
        try {
          // If the collection is huge, findOne is fast.
          // If it's empty, it returns null.
          const data = await db.collection(col.name).findOne(
            {},
            {
              projection: {
                _id: 1,
                users: 1,
                cloneName: 1,
                original: 1,
                running: 1,
              },
            },
          );

          return {
            id: data?._id || col.name,
            original: data?.original || col.name,
            cloneName: data?.cloneName || col.name, // Fallback to collection name
            users: data?.users || 0,
            running: data?.running ?? true, // Default to true if field missing
          };
        } catch (error) {
          // Fallback if individual collection query fails
          console.error(`Error fetching collection ${col.name}:`, error);
          return {
            id: col.name,
            original: col.name,
            cloneName: col.name,
            users: 0,
            running: false,
          };
        }
      }),
    );

    // 3. Filter duplicates and Sort
    const seen = new Set();
    const uniqueBookmakers = bookmakerData.filter((bookmaker) => {
      // Normalize comparison
      const key = (bookmaker.cloneName || '').toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const sortedBookmakers = uniqueBookmakers.sort((a, b) =>
      a.cloneName.localeCompare(b.cloneName),
    );

    return res.status(200).json(sortedBookmakers);
  } catch (error) {
    console.error('Error fetching bookmakers:', error);
    return res.status(500).json({
      error: 'Failed to fetch bookmakers',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
