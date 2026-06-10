/**
 * RecipeVerse Authentication Module
 */

const Auth = {
    user: null,

    init: () => {
        const token = Utils.getToken();
        if (token) {
            const userData = localStorage.getItem('rv_user');
            if (userData) Auth.user = JSON.parse(userData);
        }
        Auth.updateUI();
    },

    register: async (name, email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            
            Utils.showToast('Registration successful! Please login.', 'success');
            Auth.showModal('login');
        } catch (err) {
            Utils.showToast(err.message, 'error');
        }
    },

    login: async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            
            Utils.saveToken(data.token);
            localStorage.setItem('rv_user', JSON.stringify(data.user));
            Auth.user = data.user;
            Auth.updateUI();
            Auth.closeModal();
            Utils.showToast(`Welcome back, ${data.user.name}!`, 'success');
            App.navigate('/');
        } catch (err) {
            Utils.showToast(err.message, 'error');
        }
    },

    logout: () => {
        Utils.removeToken();
        localStorage.removeItem('rv_user');
        Auth.user = null;
        Auth.updateUI();
        Utils.showToast('Logged out successfully', 'info');
        App.navigate('/');
    },

    updateUI: () => {
        const authBtnAt = document.getElementById('auth-action');
        const navFavorites = document.getElementById('nav-favorites');
        const navPlanner = document.getElementById('nav-planner');
        
        if (!authBtnAt) return;

        if (Auth.user) {
            if (navFavorites) navFavorites.style.display = 'block';
            if (navPlanner) navPlanner.style.display = 'block';
            authBtnAt.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <div class="user-pill" onclick="App.navigate('/dashboard')" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                        <span style="width:32px; height:32px; background:var(--primary); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem;">
                            ${Auth.user.name.charAt(0).toUpperCase()}
                        </span>
                        <span style="font-weight:700; color:var(--text-main); font-size:0.9rem;">${Auth.user.name.split(' ')[0]}</span>
                    </div>
                    <button onclick="Auth.logout()" class="btn btn-outline btn-sm" style="padding: 6px 14px; font-size: 0.8rem;">Logout</button>
                </div>
            `;
        } else {
            if (navFavorites) navFavorites.style.display = 'none';
            if (navPlanner) navPlanner.style.display = 'none';
            authBtnAt.innerHTML = `<button onclick="Auth.showModal('login')" class="btn btn-primary">Sign In</button>`;
        }
    },

    showModal: (type) => {
        Auth.closeModal(); // Close existing
        const modal = document.createElement('div');
        modal.className = 'modal-overlay fade-in';
        modal.id = 'auth-modal';
        
        const isLogin = type === 'login';
        
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="Auth.closeModal()">&times;</button>
                <div style="text-align:center; margin-bottom:30px;">
                    <h2 style="font-size:1.8rem; color:var(--text-main);">${isLogin ? 'Welcome Back!' : 'Join RecipeVerse'}</h2>
                    <p style="color:var(--text-muted);">${isLogin ? 'Enter your details to continue' : 'Start your culinary journey today'}</p>
                </div>
                <form onsubmit="event.preventDefault(); Auth.handleFormSubmit('${type}')">
                    ${!isLogin ? `
                        <div style="margin-bottom:20px;">
                            <label style="display:block; margin-bottom:8px; font-weight:700; font-size:0.9rem;">Full Name</label>
                            <input type="text" id="auth-name" class="search-input" placeholder="John Doe" required style="border:1px solid #ddd; padding:12px 20px;">
                        </div>
                    ` : ''}
                    <div style="margin-bottom:20px;">
                        <label style="display:block; margin-bottom:8px; font-weight:700; font-size:0.9rem;">Email Address</label>
                        <input type="email" id="auth-email" class="search-input" placeholder="name@example.com" required style="border:1px solid #ddd; padding:12px 20px;">
                    </div>
                    <div style="margin-bottom:30px;">
                        <label style="display:block; margin-bottom:8px; font-weight:700; font-size:0.9rem;">Password</label>
                        <input type="password" id="auth-password" class="search-input" placeholder="••••••••" required style="border:1px solid #ddd; padding:12px 20px;">
                    </div>
                    <button type="submit" class="btn btn-primary w-full" style="width:100%;">${isLogin ? 'Login' : 'Create Account'}</button>
                </form>
                <div style="text-align:center; margin-top:25px; font-size:0.9rem; color:var(--text-muted);">
                    ${isLogin ? 
                        `Don't have an account? <a href="#" onclick="Auth.showModal('register'); return false;" style="color:var(--primary); font-weight:700; text-decoration:none;">Sign Up</a>` : 
                        `Already have an account? <a href="#" onclick="Auth.showModal('login'); return false;" style="color:var(--primary); font-weight:700; text-decoration:none;">Login</a>`
                    }
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    closeModal: () => {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.remove();
    },

    handleFormSubmit: (type) => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        
        if (type === 'login') {
            Auth.login(email, password);
        } else {
            const name = document.getElementById('auth-name').value;
            Auth.register(name, email, password);
        }
    },

    isAuthenticated: () => !!Auth.user
};

window.Auth = Auth;
