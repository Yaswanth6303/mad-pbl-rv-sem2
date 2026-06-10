/**
 * RecipeVerse Download Module (PDF Export)
 */

const Download = {
    asPDF: async () => {
        const recipe = Detail.currentRecipe;
        if (!recipe) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.setTextColor(249, 115, 22); // var(--primary)
        doc.text(recipe.title, 20, 20);

        // Stats
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Prep Time: ${recipe.readyInMinutes}m | Servings: ${recipe.servings} | Health Score: ${recipe.healthScore}`, 20, 30);

        // Line
        doc.setDrawColor(249, 115, 22);
        doc.line(20, 35, 190, 35);

        // Ingredients
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Ingredients', 20, 45);
        
        doc.setFontSize(10);
        let y = 55;
        recipe.extendedIngredients.forEach(ing => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(`• ${ing.original}`, 25, y);
            y += 7;
        });

        // Instructions
        y += 10;
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(16);
        doc.text('Instructions', 20, y);
        y += 10;

        doc.setFontSize(10);
        recipe.analyzedInstructions[0]?.steps.forEach(step => {
            const lines = doc.splitTextToSize(`${step.number}. ${step.step}`, 160);
            if (y + (lines.length * 5) > 270) { doc.addPage(); y = 20; }
            doc.text(lines, 20, y);
            y += (lines.length * 5) + 5;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Exported from RecipeVerse – Your Smart Food Explorer', 20, 285);

        // Save
        doc.save(`${recipe.title.replace(/\s+/g, '_')}_Recipe.pdf`);
        Utils.showToast('PDF Downloaded!', 'success');
    }
};

window.Download = Download;
