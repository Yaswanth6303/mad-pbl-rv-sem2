/**
 * RecipeVerse Timers Module
 */

const Timers = {
    activeTimers: [],

    init: () => {
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.onclick = () => Timers.start(parseInt(btn.dataset.minutes), btn.textContent);
        });
    },

    start: (minutes, label) => {
        const seconds = minutes * 60;
        const endTime = Date.now() + seconds * 1000;
        
        const timerId = setInterval(() => {
            const remaining = Math.round((endTime - Date.now()) / 1000);
            if (remaining <= 0) {
                clearInterval(timerId);
                Notifications.show('Timer Finished!', `Your "${label}" is ready.`);
                Utils.showToast(`Time's up: ${label}`, 'success');
                return;
            }
            
            // Optional: Update UI with remaining time
            const min = Math.floor(remaining / 60);
            const sec = remaining % 60;
            Utils.showToast(`Timer: ${min}:${sec < 10 ? '0' : ''}${sec} left`, 'info');
        }, 1000);
        
        Timers.activeTimers.push(timerId);
        Utils.showToast(`Timer started for ${minutes} minutes`, 'success');
    }
};

window.Timers = Timers;
