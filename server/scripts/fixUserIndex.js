const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing in server/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      console.log('Users collection not found. Creating users collection...');
      await db.createCollection('users');
    }
    const collection = db.collection('users');
    const indexes = await collection.indexes();
    const hasEmailOnlyUnique = indexes.some(
      (index) =>
        index?.unique &&
        index?.key &&
        index.key.email === 1 &&
        Object.keys(index.key).length === 1
    );

    if (hasEmailOnlyUnique) {
      console.log('Dropping legacy unique index: email_1');
      await collection.dropIndex('email_1');
    } else {
      console.log('No legacy email_1 unique index found.');
    }

    console.log('Ensuring compound unique index on { tenantId: 1, email: 1 }');
    await collection.createIndex({ tenantId: 1, email: 1 }, { unique: true });

    const finalIndexes = await collection.indexes();
    console.log('Current indexes:', finalIndexes.map((idx) => idx.name));
    console.log('Index fix complete.');
    process.exit(0);
  } catch (err) {
    console.error('Index fix failed:', err?.message || err);
    process.exit(1);
  }
};

run();
