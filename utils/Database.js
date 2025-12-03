const { Pool } = require('pg');
require('dotenv').config();

// Criar pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Verificar conexão
pool.on('error', (err) => {
  console.error('Erro na pool do PostgreSQL:', err);
});

// Inicializar base de dados
async function initializeDatabase() {
  try {
    // Tabela de sorteios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS drawings (
        id VARCHAR(255) PRIMARY KEY,
        edit_token VARCHAR(255) NOT NULL,
        organizer_token VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        max_value NUMERIC NOT NULL,
        result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de participantes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(255) PRIMARY KEY,
        drawing_id VARCHAR(255) NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de restrições
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restrictions (
        id VARCHAR(255) PRIMARY KEY,
        drawing_id VARCHAR(255) NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
        from_participant VARCHAR(255) NOT NULL,
        to_participant VARCHAR(255) NOT NULL,
        mutual_pair_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de fixações
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fixations (
        id VARCHAR(255) PRIMARY KEY,
        drawing_id VARCHAR(255) NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
        from_participant VARCHAR(255) NOT NULL,
        to_participant VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(drawing_id, from_participant)
      )
    `);

    console.log('✅ Base de dados inicializada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar base de dados:', error);
    throw error;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  query: (text, params) => pool.query(text, params)
};
