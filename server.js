const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); // added CORS
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the "public" directory
app.use(cors());  //added CORS

const LITEAPI_KEY = process.env.LITEAPI_KEY;
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Initialize the Google Generative AI client with the API key
const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);

// Endpoint to get travel data
app.post('/get-itinerary', async (req, res) => {
    try {
        const { destination, dates, preferences } = req.body;

        // Fetch places of interest based on preferences
        const placesResponse = await axios.get('https://api.liteapi.travel/v3.0/data/places', {
            params: {
                textQuery: preferences,
                near: destination,
            },
            headers: {
                'X-API-key': LITEAPI_KEY
            }
        });

        if (placesResponse.status !== 200) {
            throw new Error(`Unexpected response code: ${placesResponse.status}`);
        }

        const hotels = placesResponse.data.data;
        console.log(hotels);

        if (!hotels) {
            throw new Error('Unexpected response structure from LiteAPI');
        }

        // Use Google Generative AI to generate itinerary suggestions
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        const prompt = `Create a personalized itinerary for a trip to ${destination} from ${dates} with the following preferences: ${preferences}. Include activities, places to visit, and suggested times.`;
        console.log(prompt);

        // Use the correct structure for generating content
        const result = await model.generateContent(prompt);
        console.log(result.response.text);
        const itinerary = result.response.text || 'No itinerary generated';

        // Send the results back to the client
        res.json({
            hotels: hotels || [],
            itinerary: itinerary
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Error fetching data');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
