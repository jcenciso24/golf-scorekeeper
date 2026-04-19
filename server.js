const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

let gameData = {
  players: [],
  scores: {}
};

const ADMIN_KEY = 'golfadmin123';

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
    gameData.scores[playerName] = 0;
  }
  res.json({ success: true, data: gameData });
});

app.post('/api/admin/remove-player', (req, res) => {
  const { key, playerName } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Unauthorized' });
  
  gameData.players = gameData.players.filter(p => p !== playerName);
  delete gameData.scores[playerName];
  res.json({ success: true, data: gameData });
});

app.post('/api/admin/update-score', (req, res) => {
  const { key, playerName, score } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Unauthorized' });
  
  if (gameData.scores[playerName] !== undefined) {
    gameData.scores[playerName] = score;
  }
  res.json({ success: true, data: gameData });
});

app.post('/api/admin/reset-scores', (req, res) => {
  const { key } = req.body;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Unauthorized' });
  
  gameData.players.forEach(player => {
    gameData.scores[player] = 0;
  });
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
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔑 Admin key: ${ADMIN_KEY}`);
});