require('dotenv').config();

module.exports = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    SPOONACULAR_KEY: process.env.SPOONACULAR_API_KEY,
};
