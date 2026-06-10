/**
 * RecipeVerse Notifications Module
 */

const Notifications = {
    init: () => {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Schedule some "daily" reminders if not already scheduled
        Notifications.scheduleDailyReminder();
    },

    scheduleDailyReminder: () => {
        // Simple client-side reminder logic
        const lastReminder = localStorage.getItem('rv_last_reminder');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!lastReminder || (now - lastReminder > oneDay)) {
            // Wait 10 seconds after load to show a "welcome" or "tip" notification if permission granted
            setTimeout(() => {
                Notifications.show('New Recipes Await!', 'Check out today\'s featured cuisines on RecipeVerse.');
                localStorage.setItem('rv_last_reminder', now);
            }, 10000);
        }
    },

    show: (title, body, url = '/') => {
        if (Notification.permission === 'granted') {
            const options = {
                body: body,
                icon: '/assets/icons/logo_192.png',
                badge: '/assets/icons/logo_192.png',
                data: { url }
            };
            
            // If ServiceWorker is active, use it for better PWA behavior
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification(title, options);
                });
            } else {
                new Notification(title, options);
            }
        }
    }
};

window.Notifications = Notifications;
window.addEventListener('load', () => Notifications.init());
