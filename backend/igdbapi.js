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

async function searchGame(gameName) {
    if (!ACCESS_TOKEN) {
        console.error("No access token found");
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
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
                body: `fields name, rating, first_release_date, genres.name, summary, cover.url; 
                        limit 5; 
                        search "${gameName}";`
            }
        );

        const games = await response.json();
        return games; 
    } catch (err) {
        console.error("Error fetching games:", err);
    }
}

async function gameByPlatform(platformID) {
    
    try {
        const response = await fetch(
            "https://api.igdb.com/v4/games",
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Client-ID': CLIENT_ID,
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
                body: `fields name, rating, first_release_date, genres.name, summary, cover.url; 
                        limit 20; 
                        where platforms = ${platformID} & rating > 80 & version_parent = null;
                        sort rating desc;`
            
            }
        );
        
        const games = await response.json();
        // console.log(games)
        return selectRandomGames(games, 5); 
    } catch (err) {
        console.error("Error fetching games:", err);
    }
}

function selectRandomGames(games, count) {
    const shuffled = games.sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, count); // Take the first `count` items
}

module.exports = {
    getAccessToken,
    searchGame,
    gameByPlatform   
}

//PC -6
//ps5 - 167
//Series S/X - 169
//Switch 130

