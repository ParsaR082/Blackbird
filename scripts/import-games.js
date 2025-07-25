const mongoose = require('mongoose');
const fs = require('fs');

const PROD_MONGODB_URI = process.env.RAILWAY_MONGODB_URI || process.env.MONGODB_URI;
if (!PROD_MONGODB_URI) {
  console.error('RAILWAY_MONGODB_URI or MONGODB_URI must be set for production import!');
  process.exit(1);
}

const gameSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  imageUrl: String,
  category: String,
  color: String,
  isMultiplayer: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);

async function backupProductionGames() {
  const games = await Game.find({}).lean();
  fs.writeFileSync('game-backup-production.json', JSON.stringify(games, null, 2));
  console.log(`Production backup: ${games.length} games saved to game-backup-production.json`);
}

async function importGames() {
  await mongoose.connect(PROD_MONGODB_URI);
  await backupProductionGames();
  const backup = JSON.parse(fs.readFileSync('game-backup.json'));
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // حذف بازی‌های تکراری بر اساس title (یا هر کلید یکتا)
    for (const game of backup) {
      await Game.updateOne({ title: game.title }, { $set: game }, { upsert: true, session });
    }
    await session.commitTransaction();
    console.log(`Imported ${backup.length} games to production (upserted, no duplicates).`);
  } catch (err) {
    await session.abortTransaction();
    console.error('Import failed, transaction aborted:', err);
    process.exit(1);
  } finally {
    session.endSession();
    await mongoose.disconnect();
  }
}

importGames(); 