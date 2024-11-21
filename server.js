const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = '3bpzcko2hlfe4gub82cnl7rc7lmvax';
const CLIENT_SECRET = 'goy4tg4fc9zkoh9f2v6esmkldpcpb0'; // These ID were retrieved from my personal TWITCH Developer account, feel free to use them as they are free.
let ACCESS_TOKEN = '';


async function getAccessToken() {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
    }); 
    const data = await response.json();
    ACCESS_TOKEN = data.access_token;
    console.log(ACCESS_TOKEN + " Access Token");
}//This function is needed to be able to retrieve information from the database, as it gives us an access token to be able to make queries in the following function.


//This is another POST to the igdb server to retrieve the specific query from the games section only
app.get('/games', async (req, res) => {
    const searchQuery = req.query.search || '';
    const url = `https://api.igdb.com/v4/games`;
    const body = `
        fields name, cover.url, genres.name, summary, platforms.abbreviation;
        search "${searchQuery}";
        limit 10;
    `;
    const options = {
        method: 'POST',
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body,
    };
    const response = await fetch(url, options);
    const data = await response.json();
    res.json(data);
});

app.listen(3000, async () => {
    await getAccessToken();
    console.log('Server running on http://localhost:3000');
});