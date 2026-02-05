-- Tabela de jogos
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('A Jogar', 'Jogando', 'Zerado', 'Casual')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimizar consultas com filtros
CREATE INDEX IF NOT EXISTS idx_games_name ON games(name);
CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
