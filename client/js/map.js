/**
 * RecipeVerse Map Module
 */

const MapModule = {
    map: null,
    cuisines: [
        { name: "Indian", coords: [20.5937, 78.9629] },
        { name: "Italian", coords: [41.8719, 12.5674] },
        { name: "Japanese", coords: [36.2048, 138.2529] },
        { name: "Mexican", coords: [23.6345, -102.5528] },
        { name: "French", coords: [46.2276, 2.2137] },
        { name: "Chinese", coords: [35.8617, 104.1954] },
        { name: "Spanish", coords: [40.4637, -3.7492] },
        { name: "Greek", coords: [39.0742, 21.8243] },
        { name: "Thai", coords: [15.8700, 100.9925] },
        { name: "Turkish", coords: [38.9637, 35.2433] },
        { name: "Moroccan", coords: [31.7917, -7.0926] },
        { name: "Brazilian", coords: [-14.2350, -51.9253] },
        { name: "German", coords: [51.1657, 10.4515] },
        { name: "Korean", coords: [35.9078, 127.7669] },
        { name: "Vietnamese", coords: [14.0583, 108.2772] },
        { name: "Lebanese", coords: [33.8547, 35.8623] }
    ],

    init: () => {
        if (MapModule.map) MapModule.map.remove();
        
        MapModule.map = L.map('map-container').setView([20, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(MapModule.map);

        MapModule.cuisines.forEach(cuisine => {
            const marker = L.marker(cuisine.coords).addTo(MapModule.map);
            marker.bindPopup(`
                <div style="text-align:center;">
                    <h3 style="margin-bottom:10px;">${cuisine.name} Cuisine</h3>
                    <button onclick="MapModule.explore('${cuisine.name}')" class="btn btn-primary btn-sm">Explore Recipes</button>
                </div>
            `);
        });
    },

    explore: (cuisine) => {
        Search.performSearch(cuisine);
        App.navigate('/');
    }
};

window.MapModule = MapModule;
