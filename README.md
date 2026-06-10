# RecipeVerse

Smart Food Recipe Explorer — Express + PostgreSQL backend serving a Vanilla JS PWA.

## Project layout

```
RecipeVerse/
├── client/                      # Static PWA (HTML, CSS, JS, assets)
│   ├── index.html
│   ├── manifest.json
│   ├── serviceworker.js
│   ├── offline.html
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── data/
├── server/                      # Self-contained backend (MVC)
│   ├── package.json
│   ├── .env                     # Local config (gitignored)
│   ├── .env.example
│   ├── db/
│   │   ├── schema.sql           # PostgreSQL schema
│   │   └── migrate.js           # Schema runner
│   └── src/
│       ├── index.js             # Entry point — boots HTTP server
│       ├── app.js               # Express app + middleware + route mounts
│       ├── config/
│       │   ├── db.js            # pg Pool
│       │   └── env.js           # Env loader
│       ├── middleware/
│       │   └── auth.js          # JWT verification
│       ├── controllers/         # Request handlers
│       └── routes/              # Express routers
├── .gitignore
└── README.md
```

## Setup

All backend commands run from the `server/` directory.

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment**
   Copy `server/.env.example` to `server/.env` and fill in your values.

3. **Start PostgreSQL and create the database**
   ```bash
   createdb recipeverse
   ```

4. **Run migrations**
   ```bash
   npm run migrate
   ```

5. **Start the server**
   ```bash
   npm run dev      # auto-reload
   npm start        # production
   ```

   The PWA is served from `http://localhost:3000` (the server mounts `../client` as static).

## API

| Method | Path                              | Auth | Purpose                     |
| ------ | --------------------------------- | ---- | --------------------------- |
| POST   | `/api/auth/register`              | -    | Create user                 |
| POST   | `/api/auth/login`                 | -    | Issue JWT                   |
| GET    | `/api/recipes/search`             | -    | Spoonacular proxy           |
| GET    | `/api/recipes/random`             | -    | Random recipes (+ fallback) |
| GET    | `/api/recipes/:id/information`    | -    | Recipe detail               |
| GET    | `/api/user/favorites`             | JWT  | List favorites              |
| POST   | `/api/user/favorites`             | JWT  | Add favorite                |
| DELETE | `/api/user/favorites/:recipeId`   | JWT  | Remove favorite             |
| GET    | `/api/user/preferences`           | JWT  | Get preferences             |
| PUT    | `/api/user/preferences`           | JWT  | Update preferences          |
| GET    | `/api/user/planner`               | JWT  | List planned meals          |
| POST   | `/api/user/planner`               | JWT  | Plan a meal                 |
| DELETE | `/api/user/planner/:id`           | JWT  | Remove a meal               |
| GET    | `/api/user/grocery`               | JWT  | List grocery items          |
| POST   | `/api/user/grocery`               | JWT  | Bulk add from recipe        |
| POST   | `/api/user/grocery/item`          | JWT  | Add single item             |
| PUT    | `/api/user/grocery/:id`           | JWT  | Toggle item completion      |
| DELETE | `/api/user/grocery/:id`           | JWT  | Remove item                 |
| DELETE | `/api/user/grocery`               | JWT  | Clear list                  |
| GET    | `/api/user/history`               | JWT  | Recent searches             |
| POST   | `/api/user/history`               | JWT  | Save a search               |
