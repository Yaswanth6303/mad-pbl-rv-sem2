/**
 * RecipeVerse Search Module
 */

const Search = {
    results: [],

    init: () => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                Search.performSearch(e.target.value);
            }, 500));
            
            // Allow pressing Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') Search.performSearch(e.target.value);
            });
        }
    },

    performSearch: async (query) => {
        if (!query || query.length < 2) return;

        App.showLoader();
        try {
            // Save search history if authenticated
            if (Auth.isAuthenticated()) {
                fetch('/api/user/history', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Utils.getToken()}`
                    },
                    body: JSON.stringify({ query })
                }).catch(err => console.warn('Failed to save history', err));
            }

            // Get user preferences for exclusion
            const prefs = await Search.getUserPreferences();
            const exclude = prefs.avoidedIngredients ? prefs.avoidedIngredients.join(',') : '';

            const url = new URL('/api/recipes/search', window.location.origin);
            url.searchParams.append('query', query);
            if (exclude) url.searchParams.append('excludeIngredients', exclude);

            const res = await fetch(url);
            const data = await res.json();
            
            // Apply Smart Ranking Algorithm
            Search.results = Utils.rankRecipes(data.results || []);
            
            Search.renderResults();
            
            // If on detail or other page, navigate home to show results
            if (window.location.pathname !== '/') {
                App.navigate('/');
                // Small delay to ensure grid is rendered
                setTimeout(() => Search.renderResults(), 100);
            }
        } catch (err) {
            console.error('Search error:', err);
            Utils.showToast('Failed to fetch search results', 'error');
        } finally {
            App.hideLoader();
        }
    },

    getUserPreferences: async () => {
        if (!Auth.isAuthenticated()) return { avoidedIngredients: [] };
        try {
            const res = await fetch('/api/user/preferences', {
                headers: { 'Authorization': `Bearer ${Utils.getToken()}` }
            });
            if (!res.ok) return { avoidedIngredients: [] };
            return await res.json();
        } catch (error) {
            return { avoidedIngredients: [] };
        }
    },

    renderResults: () => {
        const container = document.getElementById('recipe-grid');
        if (!container) return;

        if (!Search.results || Search.results.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:60px 0;">
                    <h3 style="color:var(--text-muted);">No recipes found. Try another search!</h3>
                    <p style="color:var(--text-muted);">Try searching for "Pasta", "Vegan", or "India".</p>
                </div>
            `;
            return;
        }

        container.innerHTML = Search.results.map((recipe, index) => `
            <div class="recipe-card fade-in" style="animation-delay: ${index * 0.05}s" onclick="App.navigate('/recipe/${recipe.id}')">
                <div class="recipe-image-container">
                    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" loading="lazy">
                    <div class="recipe-badge">⭐️ ${recipe.spoonacularScore ? Math.round(recipe.spoonacularScore) : (recipe.healthScore || 0)}</div>
                </div>
                <div class="recipe-info">
                    <h3>${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.readyInMinutes}m</span>
                        <span>🔥 ${Math.round(recipe.nutrition?.nutrients ? recipe.nutrition.nutrients[0].amount : (recipe.calories || 0))} cal</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

window.Search = Search;
