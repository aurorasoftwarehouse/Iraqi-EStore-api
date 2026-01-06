import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import StoreOwner from './models/StoreOwner.js';

const runMigration = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const owners = await StoreOwner.find({});

  for (let owner of owners) {
    if (typeof owner.ownerChatId !== 'number' && owner.ownerChatId) {
      owner.ownerChatId = Number(owner.ownerChatId);
      await owner.save();
      console.log(`✅ Owner ${owner.ownerName} chatId fixed.`);
    }
  }

  console.log('Migration finished.');
  process.exit();
};

runMigration().catch(err => {
  console.error(err);
  process.exit(1);
});
