/**
 * RecipeVerse Main Application Module
 */

const App = {
    init: async () => {
        console.log('🚀 RecipeVerse Initializing...');
        
        // Initialize Core Services
        await IndexedDB.init();
        Auth.init();
        await Favorites.init();
        Search.init();
        
        // Handle Routing
        App.handleRoute();
        window.addEventListener('popstate', App.handleRoute);

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/serviceworker.js')
                .then(reg => console.log('SW Registered', reg))
                .catch(err => console.error('SW Failed', err));
        }

        // PWA Install — keep the FAB visible at all times so anyone can install.
        // Three runtime states for the button:
        //   1. Browser supports beforeinstallprompt (Chrome/Edge/Android) → click triggers native prompt.
        //   2. Browser doesn't fire it (iOS Safari) → click shows OS-specific instructions.
        //   3. App already running as installed PWA → hide the button (not useful in standalone mode).
        const installBtn = document.getElementById('install-btn');
        let deferredPrompt = null;

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true;

        if (installBtn) {
            if (isStandalone) {
                installBtn.hidden = true;
            } else {
                installBtn.hidden = false;
                installBtn.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        if (outcome === 'accepted') installBtn.hidden = true;
                        deferredPrompt = null;
                    } else {
                        App.showInstallInstructions();
                    }
                });
            }
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
        });

        window.addEventListener('appinstalled', () => {
            deferredPrompt = null;
            if (installBtn) installBtn.hidden = true;
            Utils.showToast('RecipeVerse installed!', 'success');
        });

        // Online/Offline Status
        window.addEventListener('online', () => Utils.showToast('We are back online!', 'success'));
        window.addEventListener('offline', () => Utils.showToast('Working offline', 'warning'));
    },

    handleRoute: () => {
        const path = window.location.pathname;
        const mainContent = document.getElementById('main-content');

        // Close any open modals when navigating
        Auth.closeModal();

        // Update active nav link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === path);
        });

        if (path === '/') {
            App.renderHome();
        } else if (path.startsWith('/recipe/')) {
            const id = path.split('/')[2];
            Detail.render(id);
        } else if (path === '/favorites') {
            if (!Auth.isAuthenticated()) return App.redirectToLogin();
            App.renderFavorites();
        } else if (path === '/planner') {
            if (!Auth.isAuthenticated()) return App.redirectToLogin();
            Planner.init();
        } else if (path === '/explore') {
            App.renderExplore();
        } else if (path === '/dashboard') {
            if (!Auth.isAuthenticated()) return App.redirectToLogin();
            App.renderDashboard();
        } else {
            App.navigate('/');
        }
    },

    navigate: (path) => {
        window.history.pushState({}, '', path);
        App.handleRoute();
        window.scrollTo(0, 0);
    },

    redirectToLogin: () => {
        Utils.showToast('Please sign in to access this feature', 'info');
        Auth.showModal('login');
        App.navigate('/');
    },

    renderHome: async () => {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <section class="search-hero fade-in">
                <div class="container">
                    <h1 class="hero-title">Discover Taste Galaxies</h1>
                    <p style="color: var(--text-muted); font-size: 1.2rem; max-width: 600px; margin: 0 auto;">
                        Smart recipe exploration powered by AI. Healthy, fast, and delicious recipes for every meal.
                    </p>
                    <div class="search-input-container">
                        <input type="text" id="search-input" class="search-input" placeholder="Search by name, ingredients, or cuisine...">
                        <button class="search-icon-btn">🔍</button>
                    </div>
                </div>
            </section>
            <div class="container">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:40px;">
                    <h2 style="font-size:1.8rem;">Featured Recipes</h2>
                </div>
                <div id="recipe-grid" class="recipe-grid">
                    ${App.renderSkeletonLoaders()}
                </div>
            </div>
        `;
        Search.init();
        
        // Fetch Featured Recipes
        try {
            const res = await fetch('/api/recipes/random', { cache: 'no-store' });
            if (!res.ok) throw new Error(`API ${res.status}`);
            const data = await res.json();
            Search.results = Array.isArray(data.recipes) ? data.recipes : [];
            Search.renderResults();
        } catch (err) {
            console.error('Failed to fetch featured recipes', err);
            const grid = document.getElementById('recipe-grid');
            if (grid) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align:center; padding:60px 0;">
                        <h3 style="color:var(--text-muted);">Couldn't load featured recipes.</h3>
                        <p style="color:var(--text-muted);">Check your connection and refresh, or try a search above.</p>
                        <button onclick="App.renderHome()" class="btn btn-primary" style="margin-top:20px;">Retry</button>
                    </div>
                `;
            }
        }
    },

    renderFavorites: () => {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <div class="container py-40" style="padding-top:60px;">
                <h1 style="font-size:2.5rem; margin-bottom:10px;">Your Favorites</h1>
                <p style="color:var(--text-muted); margin-bottom:40px;">Recipes you've saved to cook later.</p>
                <div id="recipe-grid" class="recipe-grid">
                    ${Favorites.items.map(recipe => `
                        <div class="recipe-card fade-in" onclick="App.navigate('/recipe/${recipe.recipe_id || recipe.recipeId}')">
                            <div class="recipe-image-container">
                                <img src="${recipe.image}" class="recipe-image">
                            </div>
                            <div class="recipe-info">
                                <h3>${recipe.title}</h3>
                            </div>
                        </div>
                    `).join('') || `
                        <div style="grid-column: 1/-1; text-align:center; padding:100px 0;">
                            <p style="font-size:1.2rem; color:var(--text-muted);">No favorites yet. Start exploring!</p>
                            <button onclick="App.navigate('/')" class="btn btn-primary" style="margin-top:20px;">Explore Recipes</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    renderExplore: () => {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <div class="container py-40" style="padding-top:60px;">
                <h1 style="font-size:2.5rem; margin-bottom:10px;">World Cuisines</h1>
                <p style="color:var(--text-muted); margin-bottom:40px;">Discover flavors from every corner of the globe.</p>
                <div class="glass-card" style="background:white; border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow); border:1px solid var(--glass-border);">
                    <div id="map-container" style="height:600px; width:100%;"></div>
                </div>
            </div>
        `;
        MapModule.init();
    },

    renderDashboard: async () => {
        const container = document.getElementById('main-content');
        App.showLoader();
        
        try {
            // Fetch stats
            const historyRes = await fetch('/api/user/history', { headers: { 'Authorization': `Bearer ${Utils.getToken()}` } });
            const history = await historyRes.json();
            
            const plannerRes = await fetch('/api/user/planner', { headers: { 'Authorization': `Bearer ${Utils.getToken()}` } });
            const planner = await plannerRes.json();

            container.innerHTML = `
                <div class="container py-40" style="padding-top:60px;">
                    <h1 style="font-size:2.5rem; margin-bottom:40px;">User Dashboard</h1>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; margin-bottom:40px;">
                        <div class="recipe-card" style="padding:30px; text-align:center;">
                            <h2 style="font-size:3rem; color:var(--primary);">${Favorites.items.length}</h2>
                            <p style="color:var(--text-muted); font-weight:700;">Total Favorites</p>
                        </div>
                        <div class="recipe-card" style="padding:30px; text-align:center;">
                            <h2 style="font-size:3rem; color:var(--secondary);">${planner.length}</h2>
                            <p style="color:var(--text-muted); font-weight:700;">Planned Meals</p>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:40px;">
                        <div class="recipe-card" style="padding:30px;">
                            <h3 style="margin-bottom:20px;">Recent Searches</h3>
                            <ul style="list-style:none;">
                                ${history.map(h => `
                                    <li style="padding:12px 0; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                                        <span onclick="Search.performSearch('${h.query}'); App.navigate('/')" style="cursor:pointer; font-weight:600;">🔍 ${h.query}</span>
                                        <span style="font-size:0.8rem; color:var(--text-muted);">${new Date(h.searched_at).toLocaleDateString()}</span>
                                    </li>
                                `).join('') || '<p>No search history found.</p>'}
                            </ul>
                        </div>
                        
                        <div class="recipe-card" style="padding:30px;">
                            <h3 style="margin-bottom:20px;">Quick Actions</h3>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <button onclick="App.navigate('/planner')" class="btn btn-secondary w-full" style="justify-content:flex-start;">📅 Open Meal Planner</button>
                                <button onclick="App.navigate('/favorites')" class="btn btn-secondary w-full" style="justify-content:flex-start;">❤️ View Favorites</button>
                                <button onclick="Auth.logout()" class="btn btn-outline w-full" style="justify-content:flex-start;">🚪 Logout Account</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('Dashboard error:', err);
            Utils.showToast('Failed to load dashboard data', 'error');
        } finally {
            App.hideLoader();
        }
    },

    showInstallInstructions: () => {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        const isAndroid = /android/i.test(ua);
        const isFirefox = /firefox/i.test(ua);

        let title = 'Install RecipeVerse';
        let body;
        if (isIOS) {
            body = `
                <p>To install on iOS:</p>
                <ol style="text-align:left; padding-left:20px;">
                    <li>Tap the <strong>Share</strong> button <span aria-hidden="true">⬆️</span> in Safari</li>
                    <li>Scroll and choose <strong>Add to Home Screen</strong></li>
                    <li>Tap <strong>Add</strong> in the top-right</li>
                </ol>
            `;
        } else if (isFirefox) {
            body = `
                <p>To install on Firefox:</p>
                <ol style="text-align:left; padding-left:20px;">
                    <li>Open the <strong>menu</strong> <span aria-hidden="true">☰</span></li>
                    <li>Choose <strong>Install</strong> or <strong>Add to Home Screen</strong></li>
                </ol>
            `;
        } else if (isAndroid) {
            body = `
                <p>To install on Android:</p>
                <ol style="text-align:left; padding-left:20px;">
                    <li>Open the browser <strong>menu</strong> <span aria-hidden="true">⋮</span></li>
                    <li>Choose <strong>Install app</strong> or <strong>Add to Home Screen</strong></li>
                </ol>
            `;
        } else {
            body = `
                <p>To install on desktop:</p>
                <ol style="text-align:left; padding-left:20px;">
                    <li>Click the <strong>install icon</strong> <span aria-hidden="true">⊕</span> in your browser's address bar</li>
                    <li>Or open the browser menu and choose <strong>Install RecipeVerse</strong></li>
                </ol>
                <p style="color:var(--text-muted); font-size:0.9rem; margin-top:12px;">If you don't see those options, your browser may not support PWA installation yet.</p>
            `;
        }

        const existing = document.getElementById('install-instructions-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'install-instructions-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width:440px;">
                <h2 style="margin-bottom:16px;">${title}</h2>
                <div style="color:var(--text-main); line-height:1.6;">${body}</div>
                <button class="btn btn-primary" style="margin-top:20px; width:100%;" onclick="document.getElementById('install-instructions-modal').remove()">Got it</button>
            </div>
        `;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        document.body.appendChild(modal);
    },

    renderSkeletonLoaders: () => {
        return Array(8).fill(0).map(() => `
            <div class="recipe-card skeleton" style="height: 350px;"></div>
        `).join('');
    },

    showLoader: () => {
        const loader = document.getElementById('global-loader');
        if (loader) loader.style.display = 'flex';
    },

    hideLoader: () => {
        const loader = document.getElementById('global-loader');
        if (loader) loader.style.display = 'none';
    }
};

window.onload = App.init;
window.App = App;
