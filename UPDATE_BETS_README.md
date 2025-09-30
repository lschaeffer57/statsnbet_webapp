# Bet Update Scripts with theoretical_gain Field

These scripts add the `theoretical_gain` field to all bets in the MongoDB database.

## Available Scripts

1. **`update-bets-theoretical-gain.ts`** - Updates the main `Bilan` collection
2. **`update-userhistory-theoretical-gain.ts`** - Updates all user collections in `userhistory` database
3. **`test-theoretical-gain.ts`** - Test script for main collection
4. **`test-userhistory-theoretical-gain.ts`** - Test script for user collections

## Calculation Formula

```
theoretical_gain = (stake / 100) * ev
```

Where:

- `stake` - bet amount
- `ev` - expected value in percentage

## Usage

### Main Collection (Bilan)

```bash
# Set the MONGODB_URI environment variable
export MONGODB_URI="your_mongodb_connection_string"

# Run the script
npx tsx update-bets-theoretical-gain.ts
```

### User Collections (userhistory)

```bash
# Set the MONGODB_URI environment variable
export MONGODB_URI="your_mongodb_connection_string"

# Update all user collections
npx tsx update-userhistory-theoretical-gain.ts
```

## Script Features

1. **Safety**: The script checks if `theoretical_gain` field already exists and skips such records
2. **Optimization**: Processes data in batches of 1000 records for better performance
3. **Logging**: Detailed logs of the update process
4. **Error Handling**: Skips records without required `stake` or `ev` fields
5. **Proper Typing**: Full TypeScript support with proper MongoDB types

## What the Scripts Do

### Main Collection Script

1. Connects to MongoDB
2. Retrieves all bets from the `Bilan` collection in the `bilan` database
3. For each bet:
   - Checks for the presence of `stake` and `ev` fields
   - Calculates `theoretical_gain = (stake / 100) * ev`
   - Updates the record in the database
4. Outputs update statistics

### User Collections Script

1. Connects to MongoDB
2. Lists all collections in the `userhistory` database
3. For each user collection:
   - Processes all bets in that collection
   - Applies the same logic as the main collection script
   - Provides per-collection and overall statistics
4. Outputs comprehensive update statistics across all user collections

## Result

After running the script, all bets will contain the `theoretical_gain` field with the calculated value.

## Type Updates

The `BetI` interface in `src/types/index.ts` has been updated and includes the new field:

```typescript
export interface BetI {
  // ... other fields
  theoretical_gain?: number;
  // ... remaining fields
}
```

## Batch Processing Logic

The script uses intelligent batch processing:

- Processes records in batches of 1000
- Handles cases where total records are less than batch size
- Ensures no records are skipped
- Provides detailed progress logging

## Error Handling

- Skips records without required fields (`stake` or `ev`)
- Logs skipped records with reasons
- Continues processing even if individual records fail
- Provides comprehensive error reporting
