const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const { initializeDatabase } = require('./utils/Database');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
const drawingRoutes = require('./routes/drawing');
const participantRoutes = require('./routes/participants');
const whatsappRoutes = require('./routes/whatsapp');
const drawingsManagementRoutes = require('./routes/drawings-management-postgres');
const resultsRoutes = require('./routes/results-postgres');

app.use('/api/drawing', drawingRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/drawings', drawingsManagementRoutes);
app.use('/api/results', resultsRoutes);

// Serve index.html for root path with force refresh
app.get('/', (req, res) => {
  // Disable caching completely
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('ETag', 'W/"' + Date.now() + '"'); // Unique ETag for each request
  
  // Send the file with fresh content
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, 'public', 'index.html');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Erro ao carregar página');
      return;
    }
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(data);
  });
});

// Serve resultado.html with force refresh
app.get('/resultado.html', (req, res) => {
  // Disable caching completely
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('ETag', 'W/"' + Date.now() + '"'); // Unique ETag for each request
  
  // Send the file with fresh content
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, 'public', 'resultado.html');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Erro ao carregar página');
      return;
    }
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(data);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo correu mal!' });
});

const PORT = process.env.PORT || 3000;

// Inicializar base de dados e começar servidor
async function startServer() {
  try {
    console.log('🔧 Inicializando base de dados...');
    await initializeDatabase();
    console.log('✅ Base de dados pronta!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
      console.log(`📦 DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
