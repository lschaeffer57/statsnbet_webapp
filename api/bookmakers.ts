import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();

    const db = client.db('Bookmaker');

    const collections = await db.listCollections().toArray();

    const bookmakerData = await Promise.all(
      collections.map(async (col) => {
        try {
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
            id: data?._id,
            original: data?.original,
            cloneName: data?.cloneName || col.name,
            users: data?.users || 0,
          };
        } catch (error) {
          console.error(error);
          return {
            original: col.name,
            cloneName: col.name,
            users: 0,
          };
        }
      }),
    );

    const seen = new Set();
    const uniqueBookmakers = bookmakerData.filter((bookmaker) => {
      if (seen.has(bookmaker.cloneName)) return false;
      seen.add(bookmaker.cloneName);
      return true;
    });

    const sortedBookmakers = uniqueBookmakers.sort((a, b) =>
      a.cloneName.localeCompare(b.cloneName),
    );

    return res.status(200).json(sortedBookmakers);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch bookmakers',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await client.close();
  }
}
