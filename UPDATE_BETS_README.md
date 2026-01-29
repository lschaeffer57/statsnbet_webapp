# 1. Create a temporary directory for the dump
mkdir -p temp_mongo_dump

# 2. Dump all production databases (excluding system dbs)
# Note: Using your provided credentials
echo "📉 Pulling data from Production..."
mongodump --uri="mongodb+srv://monstre57:double_monstre@international-fr.xfbkc9i.mongodb.net/" \
  --out=./temp_mongo_dump \
  --excludeDB=admin \
  --excludeDB=local \
  --excludeDB=config

# 3. Restore to Local MongoDB on port 27018
echo "📈 Pushing data to Local (localhost:27018)..."
mongorestore --uri="mongodb://localhost:27018/" \
  --drop \
  ./temp_mongo_dump

# 4. Cleanup
rm -rf temp_mongo_dump

echo "✅ Database clone complete!"