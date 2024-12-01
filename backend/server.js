const express = require("express");
const path = require("path");
const igdbapi = require("./igdbapi");

const app = express();

app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));


app.get('/gamesByPlatform', async (req, res) => {
    try {
        const platformID = req.query.search; // Get the platform ID from the query parameter
        const gamesByPlatform = await igdbapi.gameByPlatform(platformID); // Use 'const' or 'let'
        res.json(gamesByPlatform); // Return the filtered games
    } catch (error) {
        console.error('Error fetching games by platform:', error);
        res.status(500).json({ error: 'Failed to fetch games by platform' });
    }
});

app.get('/searchGame', async (req, res) => {
    try {
        const gameName = req.query.search; // Get the search term from the query parameter
        const searchedGame = await igdbapi.searchGame(gameName); 
        res.json(searchedGame); // Return the searched game
    } catch (error) {
        console.error('Error searching for game:', error);
        res.status(500).json({ error: 'Failed to search for game' });
    }
});




// Start the server and fetch data
const port = 3000;
app.listen(port, async () => {
    console.log(`Server listening on port ${port}`);
    await igdbapi.getAccessToken();
});
