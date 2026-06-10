/**
 * RecipeVerse Favorites Module
 */

const Favorites = {
    items: [],

    init: async () => {
        // Load from DB (IndexedDB for offline, API for online)
        if (navigator.onLine && Auth.isAuthenticated()) {
            try {
                const res = await fetch('/api/user/favorites', {
                    headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
                });
                Favorites.items = await res.json();
                // Update local storage/IndexedDB
                for (const item of Favorites.items) {
                    await IndexedDB.saveFavorite(item);
                }
            } catch (err) {
                console.error('Favorites sync error:', err);
                Favorites.items = await IndexedDB.getAllFavorites();
            }
        } else {
            Favorites.items = await IndexedDB.getAllFavorites();
        }
    },

    isFavorite: (id) => {
        return Favorites.items.some(item => (item.recipe_id || item.recipeId) == id);
    },

    toggle: async (id) => {
        if (!Auth.isAuthenticated()) return App.redirectToLogin();

        const recipe = Detail.currentRecipe;
        const exists = Favorites.isFavorite(id);

        try {
            if (exists) {
                // Remove
                if (navigator.onLine) {
                    await fetch(`/api/user/favorites/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
                    });
                }
                await IndexedDB.removeFavorite(id);
                Favorites.items = Favorites.items.filter(item => (item.recipe_id || item.recipeId) != id);
                Utils.showToast('Removed from favorites', 'info');
            } else {
                // Add
                if (navigator.onLine) {
                    await fetch('/api/user/favorites', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${Utils.getToken()}`
                        },
                        body: JSON.stringify({
                            recipeId: recipe.id,
                            title: recipe.title,
                            image: recipe.image
                        })
                    });
                }
                await IndexedDB.saveFavorite({
                    recipeId: recipe.id,
                    title: recipe.title,
                    image: recipe.image
                });
                Favorites.items.push({ recipe_id: recipe.id, title: recipe.title, image: recipe.image });
                Utils.showToast('Added to favorites!', 'success');
            }
            
            // Re-render UI if on favorites page or detail page
            if (window.location.pathname === '/favorites') App.renderFavorites();
            if (window.location.pathname.startsWith('/recipe/')) Detail.renderUI(recipe);
            
        } catch (err) {
            Utils.showToast('Error updating favorites', 'error');
            console.error(err);
        }
    }
};

window.Favorites = Favorites;
