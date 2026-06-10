const router = require('express').Router();
const { searchRecipes, randomRecipes, recipeById } = require('../controllers/recipeController');

router.get('/search', searchRecipes);
router.get('/random', randomRecipes);
router.get('/:id/information', recipeById);

module.exports = router;
