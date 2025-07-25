const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackbird-portal';

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

async function exportGames() {
  await mongoose.connect(MONGODB_URI);
  const games = await Game.find({}).lean();
  fs.writeFileSync('game-backup.json', JSON.stringify(games, null, 2));
  console.log(`Exported ${games.length} games to game-backup.json`);
  await mongoose.disconnect();
}

exportGames().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
}); 