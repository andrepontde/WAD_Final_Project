const CLIENT_ID = '3bpzcko2hlfe4gub82cnl7rc7lmvax';
const CLIENT_SECRET = 'goy4tg4fc9zkoh9f2v6esmkldpcpb0';
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
}

async function getGame() {
    if (!ACCESS_TOKEN) {
        console.error("No access token found. Please ensure getAccessToken() is called.");
        return;
    }

    try {
        const response = await fetch(
            "https://api.igdb.com/v4/games",
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': CLIENT_ID,
                    'Authorization': `Bearer ${ACCESS_TOKEN}`, // Add 'Bearer'
                },
                body: "fields name; limit 10;",
            }
        );

        const games = await response.json(); // Await the JSON response
        console.log(games); // Log the JSON object
    } catch (err) {
        console.error("Error fetching games:", err);
    }
}

// Execute the functions in the correct order
(async () => {
    await getAccessToken(); // Ensure the access token is retrieved first
    await getGame();        // Then fetch the games
})();
