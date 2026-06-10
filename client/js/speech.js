/**
 * RecipeVerse Speech Assistant Module
 */

const Speech = {
    synthesis: window.speechSynthesis,
    utterance: null,
    isSpeaking: false,
    isPaused: false,

    speakRecipe: () => {
        if (Speech.isSpeaking) {
            Speech.stop();
            return;
        }

        const recipe = Detail.currentRecipe;
        if (!recipe) return;

        const text = `Cooking ${recipe.title}. 
            Ingredients needed: ${recipe.extendedIngredients.map(ing => ing.original).join(', ')}. 
            Instructions: ${recipe.analyzedInstructions[0]?.steps.map(s => `Step ${s.number}: ${s.step}`).join('. ')}`;

        Speech.utterance = new SpeechSynthesisUtterance(text);
        Speech.utterance.rate = 0.9;
        
        Speech.utterance.onstart = () => {
            Speech.isSpeaking = true;
            Speech.updateButton('⏹️ Stop Reading');
        };

        Speech.utterance.onend = () => {
            Speech.isSpeaking = false;
            Speech.isPaused = false;
            Speech.updateButton('🔊 Read Aloud');
        };

        Speech.synthesis.speak(Speech.utterance);
    },

    pause: () => {
        if (Speech.synthesis.speaking && !Speech.isPaused) {
            Speech.synthesis.pause();
            Speech.isPaused = true;
            Speech.updateButton('▶️ Resume');
        } else if (Speech.isPaused) {
            Speech.synthesis.resume();
            Speech.isPaused = false;
            Speech.updateButton('⏹️ Stop Reading');
        }
    },

    stop: () => {
        Speech.synthesis.cancel();
        Speech.isSpeaking = false;
        Speech.isPaused = false;
        Speech.updateButton('🔊 Read Aloud');
    },

    updateButton: (label) => {
        const btn = document.getElementById('speech-btn');
        if (btn) btn.innerHTML = label;
    }
};

window.Speech = Speech;
