const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth');
const favorites = require('../controllers/favoritesController');
const preferences = require('../controllers/preferencesController');
const planner = require('../controllers/plannerController');
const grocery = require('../controllers/groceryController');
const history = require('../controllers/historyController');

router.use(authenticateToken);

// Favorites
router.get('/favorites', favorites.listFavorites);
router.post('/favorites', favorites.addFavorite);
router.delete('/favorites/:recipeId', favorites.removeFavorite);

// Preferences
router.get('/preferences', preferences.getPreferences);
router.put('/preferences', preferences.updatePreferences);

// Meal planner
router.get('/planner', planner.listMeals);
router.post('/planner', planner.addMeal);
router.delete('/planner/:id', planner.removeMeal);

// Grocery list
router.get('/grocery', grocery.listItems);
router.post('/grocery', grocery.addItems);
router.post('/grocery/item', grocery.addItem);
router.put('/grocery/:id', grocery.updateItem);
router.delete('/grocery/:id', grocery.removeItem);
router.delete('/grocery', grocery.clearList);

// Search history
router.get('/history', history.listHistory);
router.post('/history', history.addHistory);

module.exports = router;
