/**
 * RecipeVerse Detail View Module
 */

const Detail = {
    currentRecipe: null,

    render: async (id) => {
        App.showLoader();
        try {
            // Check cache first for offline support
            let data = await IndexedDB.getCachedRecipe(parseInt(id));
            
            if (!data && navigator.onLine) {
                const res = await fetch(`/api/recipes/${id}/information`);
                data = await res.json();
                await IndexedDB.cacheRecipe(data);
            }

            if (!data) throw new Error('Recipe not found offline');

            Detail.currentRecipe = data;
            Detail.renderUI(data);
            window.scrollTo(0, 0);
        } catch (err) {
            Utils.showToast(err.message, 'error');
            App.navigate('/');
        } finally {
            App.hideLoader();
        }
    },

    renderUI: (recipe) => {
        const container = document.getElementById('main-content');
        if (!container) return;

        const isFavorite = Favorites.isFavorite(recipe.id);

        container.innerHTML = `
            <div class="recipe-detail-container fade-in container">
                <div class="detail-header">
                    <div class="detail-image-wrapper">
                        <img src="${recipe.image}" alt="${recipe.title}" class="detail-image">
                    </div>
                    <div class="detail-content">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                            <h1 style="font-size:2.5rem; color:var(--text-main);">${recipe.title}</h1>
                            <button onclick="Favorites.toggle(${recipe.id})" class="btn ${isFavorite ? 'btn-primary' : 'btn-outline'}" id="fav-btn" style="min-width:140px;">
                                ${isFavorite ? '❤️ Saved' : '🤍 Save'}
                            </button>
                        </div>
                        
                        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:25px;">
                            ${(recipe.dishTypes || []).map(t => `<span class="tag">${t}</span>`).join('')}
                        </div>

                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:30px; background:white; padding:20px; border-radius:var(--radius-md); box-shadow:var(--shadow);">
                            <div style="text-align:center; border-right:1px solid #eee;">
                                <p style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">PREP TIME</p>
                                <p style="font-weight:800; color:var(--primary);">${recipe.readyInMinutes}m</p>
                            </div>
                            <div style="text-align:center; border-right:1px solid #eee;">
                                <p style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">SERVINGS</p>
                                <p style="font-weight:800; color:var(--primary);">${recipe.servings}</p>
                            </div>
                            <div style="text-align:center;">
                                <p style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">HEALTH</p>
                                <p style="font-weight:800; color:var(--primary);">${recipe.healthScore}/100</p>
                            </div>
                        </div>

                        <div style="display:flex; gap:15px; flex-wrap:wrap; margin-top:20px;">
                            <button onclick="Planner.showAddModal(${recipe.id})" class="btn btn-primary">📅 Add to Planner</button>
                            <button onclick="Download.asPDF()" class="btn btn-outline">📄 PDF Export</button>
                            <button onclick="Speech.speakRecipe()" class="btn btn-outline" id="speech-btn">🔊 Read Aloud</button>
                        </div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:40px; align-items:start;">
                    <div class="detail-main">
                        <section style="background:white; padding:40px; border-radius:var(--radius-lg); box-shadow:var(--shadow); margin-bottom:40px;">
                            <h2 style="margin-bottom:25px; font-size:1.8rem; color:var(--text-main);">Cooking Instructions</h2>
                            <div class="instructions-list">
                                ${recipe.analyzedInstructions[0]?.steps.map(step => `
                                    <div class="step">
                                        <span class="step-num">${step.number}</span>
                                        <p style="font-size:1.05rem;">${Utils.detectTimers(step.step)}</p>
                                    </div>
                                `).join('') || `<p style="padding:20px; text-align:center; color:var(--text-muted);">Instructions are coming from the developer's notes soon!</p>`}
                            </div>
                        </section>

                        <section style="background:white; padding:40px; border-radius:var(--radius-lg); box-shadow:var(--shadow);">
                            <h2 style="margin-bottom:25px; font-size:1.8rem; color:var(--text-main);">Nutrition Facts</h2>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; align-items:center;">
                                <div style="max-width:300px; margin:0 auto; width:100%;">
                                    <canvas id="nutrition-chart"></canvas>
                                </div>
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                    ${(recipe.nutrition?.nutrients || []).slice(0, 4).map(n => `
                                        <div style="background:#FFF7ED; padding:15px; border-radius:var(--radius-sm); text-align:center;">
                                            <p style="font-size:0.75rem; color:var(--text-muted); font-weight:800;">${n.name.toUpperCase()}</p>
                                            <p style="font-weight:800; color:var(--primary);">${Math.round(n.amount)}${n.unit}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </section>
                    </div>

                    <div class="detail-sidebar">
                        <div style="background:white; padding:30px; border-radius:var(--radius-lg); box-shadow:var(--shadow); margin-bottom:30px;">
                            <h3 style="margin-bottom:20px; font-size:1.4rem;">Ingredients</h3>
                            <ul style="list-style:none;">
                                ${(recipe.extendedIngredients || []).map(ing => `
                                    <li style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f9f9f9;">
                                        <span style="color:var(--primary); font-weight:800;">•</span>
                                        <span style="font-size:0.95rem;">${ing.original}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <div style="background:white; padding:30px; border-radius:var(--radius-lg); box-shadow:var(--shadow);">
                            <h3 style="margin-bottom:20px; font-size:1.4rem;">Summary</h3>
                            <div style="font-size:0.9rem; color:var(--text-muted);">
                                ${recipe.summary ? recipe.summary.split('.').slice(0, 3).join('.') + '.' : 'No summary available.'}
                            </div>
                            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' recipe')}" target="_blank" class="btn btn-primary w-full" style="width:100%; margin-top:20px;">
                                ▶️ Watch Cooking Video
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize Nutrition Chart
        if (recipe.nutrition?.nutrients) {
            setTimeout(() => Charts.initNutrition(recipe.nutrition.nutrients), 100);
        }
        
        // Initialize Timers
        Timers.init();
    }
};

window.Detail = Detail;
