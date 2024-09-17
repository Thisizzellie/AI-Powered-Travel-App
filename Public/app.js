document.getElementById('travel-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    const destination = document.getElementById('destination').value;
    const dates = document.getElementById('dates').value;
    const preferences = document.getElementById('preferences').value;

    const response = await fetch('/get-itinerary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination, dates, preferences })
    });

    const result = await response.json();

    // Display the hotels and itinerary
    const placeList = result.hotels.map(place => `
        <div class="place">
            <h3>${place.displayName}</h3>
            <p><strong>Address:</strong> ${place.formattedAddress}</p>
            <p><strong>Types:</strong> ${place.types.join(', ')}</p>
        </div>
    `).join('');

    document.getElementById('result').innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Your Itinerary</h2>
        <div><strong>Places of Interest:</strong> ${placeList || 'No places found'}</div>
        <div><strong>Itinerary:</strong> <p>${result.itinerary || 'No itinerary generated'}</p></div>
    `;
});
