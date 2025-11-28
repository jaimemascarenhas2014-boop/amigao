const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
const drawingRoutes = require('./routes/drawing');
const participantRoutes = require('./routes/participants');
const whatsappRoutes = require('./routes/whatsapp');
const drawingsManagementRoutes = require('./routes/drawings-management');
const resultsRoutes = require('./routes/results');

app.use('/api/drawing', drawingRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/drawings', drawingsManagementRoutes);
app.use('/api/results', resultsRoutes);

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo correu mal!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});

module.exports = app;
