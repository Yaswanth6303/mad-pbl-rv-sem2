/**
 * RecipeVerse Offline Storage Module (IndexedDB)
 */

const DB_NAME = 'RecipeVerseDB';
const DB_VERSION = 1;

const IndexedDB = {
    db: null,

    init: () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Favorites Store
                if (!db.objectStoreNames.contains('favorites')) {
                    db.createObjectStore('favorites', { keyPath: 'recipeId' });
                }
                // Meal Planner Store
                if (!db.objectStoreNames.contains('mealPlan')) {
                    db.createObjectStore('mealPlan', { keyPath: 'id', autoIncrement: true });
                }
                // Caches for Detailed Recipes
                if (!db.objectStoreNames.contains('recipes_cache')) {
                    db.createObjectStore('recipes_cache', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                IndexedDB.db = event.target.result;
                resolve(IndexedDB.db);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    },

    // Save Favorite
    saveFavorite: async (recipe) => {
        const tx = IndexedDB.db.transaction('favorites', 'readwrite');
        const store = tx.objectStore('favorites');
        await store.put({ ...recipe, savedAt: new Date().toISOString() });
        return tx.complete;
    },

    // Remove Favorite
    removeFavorite: async (recipeId) => {
        const tx = IndexedDB.db.transaction('favorites', 'readwrite');
        const store = tx.objectStore('favorites');
        await store.delete(recipeId);
        return tx.complete;
    },

    // Get All Favorites
    getAllFavorites: () => {
        return new Promise((resolve) => {
            const tx = IndexedDB.db.transaction('favorites', 'readonly');
            const store = tx.objectStore('favorites');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
        });
    },

    // Cache Detailed Recipe
    cacheRecipe: async (recipe) => {
        const tx = IndexedDB.db.transaction('recipes_cache', 'readwrite');
        const store = tx.objectStore('recipes_cache');
        await store.put(recipe);
        return tx.complete;
    },

    // Get Cached Recipe
    getCachedRecipe: (id) => {
        return new Promise((resolve) => {
            const tx = IndexedDB.db.transaction('recipes_cache', 'readonly');
            const store = tx.objectStore('recipes_cache');
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
        });
    }
};

window.IndexedDB = IndexedDB;
