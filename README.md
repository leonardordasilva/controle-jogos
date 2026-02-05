# 🎮 Controle de Jogos

Sistema completo para gerenciar sua lista de jogos com funcionalidades de CRUD (Create, Read, Update, Delete) e filtros avançados.

## 📋 Visão Geral

Aplicação web desenvolvida com Hono e Cloudflare Pages para controlar e organizar sua coleção de jogos. Oferece uma interface moderna e intuitiva para adicionar, editar, excluir e filtrar jogos por múltiplos critérios.

## 🌐 URLs

- **GitHub**: https://github.com/leonardordasilva/controle-jogos
- **Produção (Sandbox)**: https://3000-ili91fs3mttuv9obbng3u-18e660f9.sandbox.novita.ai
- **API Base**: https://3000-ili91fs3mttuv9obbng3u-18e660f9.sandbox.novita.ai/api/games

## 📊 Estatísticas da Coleção

**Total de Jogos**: 228 jogos importados

**Por Status:**
- 🟢 **Zerados**: 48 jogos
- 🟡 **A Jogar**: 117 jogos
- 🔵 **Jogando**: 1 jogo
- 🟣 **Casual**: 62 jogos

**Principais Plataformas:**
- Nintendo Wii (maioria)
- Nintendo Switch (28 jogos)
- PC (vários jogos modernos)
- PlayStation 4 (série Kingdom Hearts)
- Xbox (alguns títulos)

## ✨ Funcionalidades

### ✅ Funcionalidades Implementadas

1. **CRUD Completo de Jogos**
   - ✅ Criar novos jogos
   - ✅ Listar todos os jogos
   - ✅ Editar jogos existentes
   - ✅ Excluir jogos

2. **Sistema de Filtros**
   - ✅ Filtro por nome (busca parcial)
   - ✅ Filtro por plataforma (busca parcial)
   - ✅ Filtro por situação (exato)
   - ✅ Combinação de múltiplos filtros
   - ✅ Limpar filtros

3. **Campos dos Jogos**
   - Nome do jogo
   - Plataforma (PC, PlayStation 5, Nintendo Switch, Xbox, etc.)
   - Situação:
     - 🟡 **A Jogar** - Jogos na sua fila
     - 🔵 **Jogando** - Jogos em andamento
     - 🟢 **Zerado** - Jogos completados
     - 🟣 **Casual** - Jogos que você joga casualmente

4. **Interface Moderna**
   - Design responsivo com Tailwind CSS
   - Tema escuro com gradiente roxo/azul
   - Ícones FontAwesome
   - Efeitos de hover e transições suaves
   - Badges coloridos por status

### 🚧 Funcionalidades Não Implementadas

- Sistema de usuários e autenticação
- Avaliação de jogos (estrelas/nota)
- Tempo jogado
- Categorias/gêneros
- Capa/imagens dos jogos
- Progresso percentual
- Notas e comentários
- Data de conclusão
- Exportar/importar lista

## 📊 Modelo de Dados

### Tabela: `games`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | ID único (auto-incremento) |
| name | TEXT | Nome do jogo (obrigatório) |
| platform | TEXT | Plataforma do jogo (obrigatório) |
| status | TEXT | Situação: A Jogar, Jogando, Zerado, Casual |
| created_at | DATETIME | Data de criação |
| updated_at | DATETIME | Data da última atualização |

**Índices criados para otimização:**
- idx_games_name
- idx_games_platform
- idx_games_status

## 🔌 API Endpoints

### GET /api/games
Lista todos os jogos com filtros opcionais.

**Query Parameters:**
- `name` - Busca parcial no nome (LIKE %value%)
- `platform` - Busca parcial na plataforma (LIKE %value%)
- `status` - Busca exata na situação

**Exemplo de resposta:**
```json
{
  "success": true,
  "games": [
    {
      "id": 1,
      "name": "The Legend of Zelda: Breath of the Wild",
      "platform": "Nintendo Switch",
      "status": "Zerado",
      "created_at": "2026-02-05 01:25:43",
      "updated_at": "2026-02-05 01:25:43"
    }
  ]
}
```

### GET /api/games/:id
Busca um jogo específico por ID.

### POST /api/games
Cria um novo jogo.

**Body:**
```json
{
  "name": "Nome do Jogo",
  "platform": "PC",
  "status": "A Jogar"
}
```

### PUT /api/games/:id
Atualiza um jogo existente.

**Body:**
```json
{
  "name": "Nome Atualizado",
  "platform": "PlayStation 5",
  "status": "Jogando"
}
```

### DELETE /api/games/:id
Exclui um jogo.

## 🗄️ Armazenamento

**Cloudflare D1 Database** - SQLite distribuído globalmente
- Desenvolvimento local: `.wrangler/state/v3/d1/` (SQLite local)
- Produção: Cloudflare D1 Database (necessita configuração)

## 🚀 Como Usar

### Adicionar Jogo
1. Preencha o formulário "Adicionar Jogo"
2. Digite o nome, plataforma e selecione a situação
3. Clique em "Salvar"

### Filtrar Jogos
1. Use os campos de filtro
2. Clique em "Buscar" ou pressione Enter
3. Use "Limpar" para resetar os filtros

### Editar Jogo
1. Clique no botão amarelo (ícone de lápis)
2. O formulário será preenchido com os dados
3. Faça as alterações e clique em "Atualizar"

### Excluir Jogo
1. Clique no botão vermelho (ícone de lixeira)
2. Confirme a exclusão

## 🛠️ Stack Tecnológico

- **Backend**: Hono (framework web para Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: HTML5 + TailwindCSS + Axios
- **Ícones**: FontAwesome
- **Deploy**: Cloudflare Pages
- **Gerenciador de Processos**: PM2 (desenvolvimento)

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento local
npm run dev:sandbox

# Build do projeto
npm run build

# Migrações do banco de dados
npm run db:migrate:local   # Aplicar migrations localmente
npm run db:seed            # Popular com dados de exemplo
npm run db:reset           # Resetar banco local

# Deploy
npm run deploy:prod        # Deploy para produção

# Utilitários
npm run clean-port         # Limpar porta 3000
npm test                   # Testar servidor
```

## 📈 Próximos Passos Recomendados

1. **Sistema de Autenticação**
   - Adicionar login de usuários
   - Lista de jogos privada por usuário

2. **Recursos Avançados**
   - Upload de capas dos jogos
   - Sistema de avaliação (1-5 estrelas)
   - Tempo jogado
   - Gêneros/categorias

3. **Melhorias de UX**
   - Paginação da lista
   - Ordenação customizável
   - Exportar lista (JSON, CSV)
   - Dark/Light theme toggle

4. **Integrações**
   - API IGDB para buscar informações de jogos
   - Sincronização com Steam/PlayStation/Xbox
   - Conquistas/troféus

5. **Deploy em Produção**
   - Configurar API token do Cloudflare
   - Criar database D1 na produção
   - Configurar domínio customizado

## 📝 Status do Deploy

- **Status Local**: ✅ Ativo
- **Status Produção**: ⏳ Aguardando configuração da API Key do Cloudflare

Para fazer deploy em produção:
1. Vá para a aba **Deploy** no sidebar
2. Configure sua API Key do Cloudflare
3. Execute: `npm run deploy:prod`

## 📄 Licença

Este projeto foi desenvolvido como demonstração e está livre para uso e modificação.

---

**Desenvolvido com Hono + Cloudflare Pages** 🚀
