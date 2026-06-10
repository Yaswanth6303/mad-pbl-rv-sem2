const app = require('./app');
const { PORT } = require('./config/env');
const { pool } = require('./config/db');

const server = app.listen(PORT, () => {
    console.log(`RecipeVerse Server running at http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
