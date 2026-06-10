/**
 * RecipeVerse Charts Module (Chart.js)
 */

const Charts = {
    nutritionChart: null,

    initNutrition: (nutrients) => {
        const ctx = document.getElementById('nutrition-chart');
        if (!ctx) return;

        // Extract main macros
        const macros = ['Calories', 'Fat', 'Carbohydrates', 'Protein'];
        const filtered = nutrients.filter(n => macros.includes(n.name));

        if (Charts.nutritionChart) Charts.nutritionChart.destroy();

        Charts.nutritionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: filtered.map(n => n.name),
                datasets: [{
                    label: 'Amount',
                    data: filtered.map(n => n.amount),
                    backgroundColor: [
                        '#F97316', // Calories - Primary Orange
                        '#EF4444', // Fat - Secondary Red
                        '#EAB308', // Carbs - Yellow/Amber
                        '#22C55E'  // Protein - Green
                    ],
                    borderWidth: 5,
                    borderColor: '#ffffff',
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            color: '#431407', 
                            font: { 
                                family: 'Poppins',
                                weight: '600',
                                size: 11
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: '#431407',
                        titleFont: { family: 'Poppins' },
                        bodyFont: { family: 'Nunito' },
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                cutout: '70%'
            }
        });
    }
};

window.Charts = Charts;
