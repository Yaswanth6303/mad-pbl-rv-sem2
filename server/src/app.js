const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const userRoutes = require('./routes/user.routes');

const CLIENT_DIR = path.join(__dirname, '..', '..', 'client');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(CLIENT_DIR));

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/user', userRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

module.exports = app;
