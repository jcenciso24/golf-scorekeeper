const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const ADMIN_KEY = 'golfadmin123';
const DATA_FILE = 'golf-data.json');

// Load saved data
let gameData = { 
  players: [], 
  scores: {}  // { playerName: [score1..score18] }
};

if (fs.existsSync(DATA_FILE)) {
  try {
    const saved = fs.readFileSync(DATA_FILE, 'utf8');
    gameData = JSON.parse(saved);
    console.log('✅ Loaded saved scores');
  } catch (err) {
    console.log('⚠️ Could not load saved data, starting fresh');
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(gameData, null, 2));
}

app.get('/api/scores', (req, res) => {
  res.json({
    players: gameData.players,
    scores: gameData.scores,
    isAdmin: false
  });
});

app.post('/api/admin/verify', (req, res) => {
  const { key } = req.body;
  if (key === ADMIN_KEY) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, error: 'Invalid admin key' });
  }
});

app.post('/api/admin/add-player', (req, res) => {
  const { key, playerName } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Unauthorized' });
  
  if (!gameData.players.includes(playerName)) {
    gameData.players.push(playerName);
    gameData.scores[playerName] = Array(18).fill(0);
    saveData();
  }
  res.json({ success: true, data: gameData });
});

app.post('/api/admin/remove-player', (req, res) => {
  const { key, playerName } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Unauthorized' });
  
  gameData.players = gameData.players.filter(p => p !== playerName);
  delete gameData.scores[playerName];
  saveData();
  res.json({ success: true, data: gameData });
});

app.post('/api/admin/update-score-full', (req, res) => {
  const { key, playerName, scores } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Unauthorized' });
  
  if (gameData.scores[playerName]) {
    gameData.scores[playerName] = scores;
    saveData();
  }
  res.json({ success: true, data: gameData });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 Admin key: ${ADMIN_KEY}`);
});
