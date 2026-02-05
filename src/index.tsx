import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
}

type Game = {
  id?: number;
  name: string;
  platform: string;
  status: 'A Jogar' | 'Jogando' | 'Zerado' | 'Casual';
  created_at?: string;
  updated_at?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// API Routes

// GET all games with optional filters
app.get('/api/games', async (c) => {
  const { env } = c;
  const { name, platform, status } = c.req.query();

  let query = 'SELECT * FROM games WHERE 1=1';
  const params: string[] = [];

  if (name) {
    query += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }

  if (platform) {
    query += ' AND platform LIKE ?';
    params.push(`%${platform}%`);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const result = await env.DB.prepare(query).bind(...params).all();
    return c.json({ success: true, games: result.results });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch games' }, 500);
  }
})

// GET single game by ID
app.get('/api/games/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');

  try {
    const result = await env.DB.prepare('SELECT * FROM games WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json({ success: false, error: 'Game not found' }, 404);
    }

    return c.json({ success: true, game: result });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch game' }, 500);
  }
})

// POST create new game
app.post('/api/games', async (c) => {
  const { env } = c;

  try {
    const body = await c.req.json<Game>();
    const { name, platform, status } = body;

    if (!name || !platform || !status) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const validStatuses = ['A Jogar', 'Jogando', 'Zerado', 'Casual'];
    if (!validStatuses.includes(status)) {
      return c.json({ success: false, error: 'Invalid status' }, 400);
    }

    const result = await env.DB.prepare(
      'INSERT INTO games (name, platform, status) VALUES (?, ?, ?)'
    ).bind(name, platform, status).run();

    return c.json({ 
      success: true, 
      game: { id: result.meta.last_row_id, name, platform, status }
    }, 201);
  } catch (error) {
    return c.json({ success: false, error: 'Failed to create game' }, 500);
  }
})

// PUT update game
app.put('/api/games/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');

  try {
    const body = await c.req.json<Game>();
    const { name, platform, status } = body;

    if (!name || !platform || !status) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }

    const validStatuses = ['A Jogar', 'Jogando', 'Zerado', 'Casual'];
    if (!validStatuses.includes(status)) {
      return c.json({ success: false, error: 'Invalid status' }, 400);
    }

    await env.DB.prepare(
      'UPDATE games SET name = ?, platform = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, platform, status, id).run();

    return c.json({ success: true, game: { id: parseInt(id), name, platform, status } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update game' }, 500);
  }
})

// DELETE game
app.delete('/api/games/:id', async (c) => {
  const { env } = c;
  const id = c.req.param('id');

  try {
    await env.DB.prepare('DELETE FROM games WHERE id = ?').bind(id).run();
    return c.json({ success: true, message: 'Game deleted' });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete game' }, 500);
  }
})

// Frontend route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Controle de Jogos</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            /* Fix para dropdown de select - options visíveis com fundo escuro */
            select option {
                background-color: #1e293b;
                color: white;
                padding: 8px;
            }
            
            select option:hover {
                background-color: #334155;
            }
        </style>
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <i class="fas fa-gamepad"></i>
                    Controle de Jogos
                </h1>
                <p class="text-blue-200">Gerencie sua lista de jogos</p>
            </div>

            <!-- Add Game Form -->
            <div class="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6 border border-white/20">
                <h2 class="text-2xl font-bold text-white mb-4">
                    <i class="fas fa-plus-circle mr-2"></i>
                    <span id="form-title">Adicionar Jogo</span>
                </h2>
                <form id="gameForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="hidden" id="gameId">
                    <div>
                        <label class="block text-white text-sm font-bold mb-2">Nome</label>
                        <input type="text" id="gameName" required
                            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Nome do jogo">
                    </div>
                    <div>
                        <label class="block text-white text-sm font-bold mb-2">Plataforma</label>
                        <input type="text" id="gamePlatform" required
                            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Ex: PC, PS5, Switch">
                    </div>
                    <div>
                        <label class="block text-white text-sm font-bold mb-2">Situação</label>
                        <select id="gameStatus" required
                            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <option value="A Jogar">A Jogar</option>
                            <option value="Jogando">Jogando</option>
                            <option value="Zerado">Zerado</option>
                            <option value="Casual">Casual</option>
                        </select>
                    </div>
                    <div class="flex items-end gap-2">
                        <button type="submit" id="submitBtn"
                            class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition">
                            <i class="fas fa-save mr-2"></i>Salvar
                        </button>
                        <button type="button" id="cancelBtn" style="display: none;"
                            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Filters -->
            <div class="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6 border border-white/20">
                <h2 class="text-2xl font-bold text-white mb-4">
                    <i class="fas fa-filter mr-2"></i>
                    Filtros
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-white text-sm font-bold mb-2">Nome</label>
                        <input type="text" id="filterName"
                            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Buscar por nome">
                    </div>
                    <div>
                        <label class="block text-white text-sm font-bold mb-2">Plataforma</label>
                        <input type="text" id="filterPlatform"
                            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Buscar por plataforma">
                    </div>
                    <div>
                        <label class="block text-white text-sm font-bold mb-2">Situação</label>
                        <select id="filterStatus"
                            class="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <option value="">Todas</option>
                            <option value="A Jogar">A Jogar</option>
                            <option value="Jogando">Jogando</option>
                            <option value="Zerado">Zerado</option>
                            <option value="Casual">Casual</option>
                        </select>
                    </div>
                </div>
                <div class="mt-4 flex gap-2">
                    <button id="applyFilters" 
                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition">
                        <i class="fas fa-search mr-2"></i>Buscar
                    </button>
                    <button id="clearFilters" 
                        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">
                        <i class="fas fa-eraser mr-2"></i>Limpar
                    </button>
                </div>
            </div>

            <!-- Games List -->
            <div class="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                <h2 class="text-2xl font-bold text-white mb-4">
                    <i class="fas fa-list mr-2"></i>
                    Meus Jogos (<span id="gamesCount">0</span>)
                </h2>
                <div id="gamesList" class="space-y-3">
                    <!-- Games will be loaded here -->
                </div>
                <div id="emptyState" class="text-center py-12 text-white/60 hidden">
                    <i class="fas fa-inbox text-6xl mb-4"></i>
                    <p class="text-xl">Nenhum jogo encontrado</p>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const API_URL = '/api/games';
            let editingId = null;

            // Status colors
            const statusColors = {
                'A Jogar': 'bg-yellow-500',
                'Jogando': 'bg-blue-500',
                'Zerado': 'bg-green-500',
                'Casual': 'bg-purple-500'
            };

            // Load games
            async function loadGames(filters = {}) {
                try {
                    const params = new URLSearchParams();
                    if (filters.name) params.append('name', filters.name);
                    if (filters.platform) params.append('platform', filters.platform);
                    if (filters.status) params.append('status', filters.status);

                    const response = await axios.get(\`\${API_URL}?\${params}\`);
                    const games = response.data.games;

                    document.getElementById('gamesCount').textContent = games.length;

                    const gamesList = document.getElementById('gamesList');
                    const emptyState = document.getElementById('emptyState');

                    if (games.length === 0) {
                        gamesList.innerHTML = '';
                        emptyState.classList.remove('hidden');
                        return;
                    }

                    emptyState.classList.add('hidden');
                    gamesList.innerHTML = games.map(game => \`
                        <div class="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition">
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <h3 class="text-xl font-bold text-white mb-1">\${game.name}</h3>
                                    <div class="flex flex-wrap gap-2 items-center">
                                        <span class="text-sm text-blue-200">
                                            <i class="fas fa-desktop mr-1"></i>\${game.platform}
                                        </span>
                                        <span class="\${statusColors[game.status]} text-white text-xs font-bold px-3 py-1 rounded-full">
                                            \${game.status}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <button onclick="editGame(\${game.id})" 
                                        class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteGame(\${game.id})" 
                                        class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error loading games:', error);
                    alert('Erro ao carregar jogos');
                }
            }

            // Save game (create or update)
            document.getElementById('gameForm').addEventListener('submit', async (e) => {
                e.preventDefault();

                const id = document.getElementById('gameId').value;
                const name = document.getElementById('gameName').value;
                const platform = document.getElementById('gamePlatform').value;
                const status = document.getElementById('gameStatus').value;

                try {
                    if (id) {
                        // Update
                        await axios.put(\`\${API_URL}/\${id}\`, { name, platform, status });
                    } else {
                        // Create
                        await axios.post(API_URL, { name, platform, status });
                    }

                    resetForm();
                    loadGames(getCurrentFilters());
                } catch (error) {
                    console.error('Error saving game:', error);
                    alert('Erro ao salvar jogo');
                }
            });

            // Edit game
            async function editGame(id) {
                try {
                    const response = await axios.get(\`\${API_URL}/\${id}\`);
                    const game = response.data.game;

                    document.getElementById('gameId').value = game.id;
                    document.getElementById('gameName').value = game.name;
                    document.getElementById('gamePlatform').value = game.platform;
                    document.getElementById('gameStatus').value = game.status;

                    document.getElementById('form-title').textContent = 'Editar Jogo';
                    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save mr-2"></i>Atualizar';
                    document.getElementById('cancelBtn').style.display = 'block';

                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } catch (error) {
                    console.error('Error loading game:', error);
                    alert('Erro ao carregar jogo');
                }
            }

            // Delete game
            async function deleteGame(id) {
                if (!confirm('Tem certeza que deseja excluir este jogo?')) return;

                try {
                    await axios.delete(\`\${API_URL}/\${id}\`);
                    loadGames(getCurrentFilters());
                } catch (error) {
                    console.error('Error deleting game:', error);
                    alert('Erro ao excluir jogo');
                }
            }

            // Reset form
            function resetForm() {
                document.getElementById('gameForm').reset();
                document.getElementById('gameId').value = '';
                document.getElementById('form-title').textContent = 'Adicionar Jogo';
                document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save mr-2"></i>Salvar';
                document.getElementById('cancelBtn').style.display = 'none';
            }

            // Cancel edit
            document.getElementById('cancelBtn').addEventListener('click', resetForm);

            // Get current filters
            function getCurrentFilters() {
                return {
                    name: document.getElementById('filterName').value,
                    platform: document.getElementById('filterPlatform').value,
                    status: document.getElementById('filterStatus').value
                };
            }

            // Apply filters
            document.getElementById('applyFilters').addEventListener('click', () => {
                loadGames(getCurrentFilters());
            });

            // Clear filters
            document.getElementById('clearFilters').addEventListener('click', () => {
                document.getElementById('filterName').value = '';
                document.getElementById('filterPlatform').value = '';
                document.getElementById('filterStatus').value = '';
                loadGames();
            });

            // Enter key on filters
            ['filterName', 'filterPlatform'].forEach(id => {
                document.getElementById(id).addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') loadGames(getCurrentFilters());
                });
            });

            // Filter status change
            document.getElementById('filterStatus').addEventListener('change', () => {
                loadGames(getCurrentFilters());
            });

            // Initial load
            loadGames();
        </script>
    </body>
    </html>
  `)
})

export default app
