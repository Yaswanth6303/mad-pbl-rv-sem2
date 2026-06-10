-- RecipeVerse PostgreSQL schema

CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    name                TEXT NOT NULL,
    email               TEXT UNIQUE NOT NULL,
    password            TEXT NOT NULL,
    preferences         JSONB NOT NULL DEFAULT '{}'::jsonb,
    avoided_ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id  INTEGER NOT NULL,
    title      TEXT NOT NULL,
    image      TEXT,
    saved_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS meal_planner (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id     INTEGER NOT NULL,
    title         TEXT NOT NULL,
    image         TEXT,
    planned_date  DATE NOT NULL,
    meal_type     TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'))
);

CREATE TABLE IF NOT EXISTS search_history (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query        TEXT NOT NULL,
    searched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grocery_lists (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name     TEXT NOT NULL,
    amount        NUMERIC,
    unit          TEXT,
    is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
    recipe_id     INTEGER,
    added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favorites_user      ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_planner_user   ON meal_planner(user_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user  ON grocery_lists(user_id);
