const mongoose = require('mongoose');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Package = require('../models/Package');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const SupportTicket = require('../models/SupportTicket');
const UpgradeRequest = require('../models/UpgradeRequest');
const AdminSettings = require('../models/AdminSettings');
const BillingRun = require('../models/BillingRun');

const MONGO_URI = process.env.MONGO_URI;
const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || 'default';

if (!MONGO_URI) {
  console.error('MONGO_URI is required');
  process.exit(1);
}

const missingTenantFilter = {
  $or: [{ tenantId: { $exists: false } }, { tenantId: null }, { tenantId: '' }],
};

const backfillCollection = async (Model, name) => {
  const result = await Model.updateMany(missingTenantFilter, {
    $set: { tenantId: DEFAULT_TENANT_ID },
  });
  const matched = result.matchedCount ?? result.n ?? 0;
  const modified = result.modifiedCount ?? result.nModified ?? 0;
  console.log(`${name}: matched=${matched}, updated=${modified}`);
};

const backfillAdminSettings = async () => {
  const docs = await AdminSettings.find(missingTenantFilter).select('_id').lean();
  if (docs.length === 0) {
    console.log('AdminSettings: matched=0, updated=0');
    return;
  }

  const [first, ...rest] = docs;
  if (first) {
    await AdminSettings.updateOne({ _id: first._id }, { $set: { tenantId: DEFAULT_TENANT_ID } });
  }

  let updated = first ? 1 : 0;
  for (const doc of rest) {
    const legacyTenantId = `${DEFAULT_TENANT_ID}__legacy__${doc._id}`;
    await AdminSettings.updateOne(
      { _id: doc._id },
      { $set: { tenantId: legacyTenantId } }
    );
    updated += 1;
  }

  console.log(
    `AdminSettings: matched=${docs.length}, updated=${updated}${
      rest.length > 0 ? ' (legacy tenantIds assigned to avoid unique conflicts)' : ''
    }`
  );
};

const run = async () => {
  await mongoose.connect(MONGO_URI);

  await backfillCollection(User, 'User');
  await backfillCollection(Connection, 'Connection');
  await backfillCollection(Package, 'Package');
  await backfillCollection(Bill, 'Bill');
  await backfillCollection(Payment, 'Payment');
  await backfillCollection(SupportTicket, 'SupportTicket');
  await backfillCollection(UpgradeRequest, 'UpgradeRequest');
  await backfillCollection(BillingRun, 'BillingRun');
  await backfillAdminSettings();

  await mongoose.disconnect();
  console.log('TenantId backfill complete.');
};

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
