//When a platform ID is inserted in the population methods, it fetches games from IGDB only for that platform
async function fetchPlatform(platformID) {
    try {
        const response = await fetch(`/gamesByPlatform/${platformID}`);
        const gamesByPlatform = await response.json(); // Parse the response as JSON
        if (gamesByPlatform.length === 0) {
                console.log('No games found or data is not an array.');
                return; 
        }
        //console.log(gamesByPlatform[0].name); 
        return gamesByPlatform;
    } catch (error) {
            console.error('Error fetching games:', error);
    }
}

//Function to search for a game comunicating with the server and IGDB page
async function searchGame(gameName) {
    try {
        const response = await fetch(`/searchGame?search=${gameName}`);
        const searchedGames = await response.json();
        if (searchedGames.length === 0) {
                console.log('No games found or data is not an array.');
                return; 
        } 
        // console.log(searchedGames[0].name); 
            return searchedGames;
    } catch (error) {
            console.error('Error fetching games:', error);
    }
}

//This function calls the searchGame function and populates the respective div.
async function searchBar() {
    var theGame = document.getElementById("findText").value;
    searchedGame =  await searchGame(theGame);
    if (searchedGame && searchedGame.length > 0) {
        populateDiv(searchedGame, "searchedGames");
    } else {
        document.getElementById("searchedGames").innerHTML = "No game was found";
    }
}

//This function populates the main page by filling each div individually with the populate div function
async function indexPopulation(){
    const pcGames = await fetchPlatform(6);
    populateDiv(pcGames, "PCGamesDiv")

    const ps5Games = await fetchPlatform(167);
    populateDiv(ps5Games, "PS5GamesDiv")
}

//This function populates the service page by filling each div individually with the populate div function
async function servicePopulation(){
    const pcGames = await fetchPlatform(6);
    populateDiv(pcGames, "PCGamesDiv")

    const ps5Games = await fetchPlatform(167);
    populateDiv(ps5Games, "PS5GamesDiv")

    const xboxGames = await fetchPlatform(49);
    populateDiv(xboxGames, "xboxGamesDiv")

    const SwitchGames = await fetchPlatform(130);
    populateDiv(SwitchGames, "SwitchGamesDiv")
}

//This function call other functions to populate or update the wishlist page
async function wishListPopulation() {
    const wishedGames = await fetchWishlist();
    populateDiv(wishedGames,"WishlistGames")
    renderWishlistChart();
    renderRatingChart();
}

//Function called when a game is clicked so it can appear as a pop up on the screen
function popUpGame(gameString) {
    const game = JSON.parse(gameString)
    populateDiv([game], "PopUpGamesDiv"); 
}

//Function to create a completely new game.
async function addNewGame() {
    const gameName = document.getElementById("gameName").value;
    const rating = parseFloat(document.getElementById("gameRating").value);
    const gameID = parseInt(document.getElementById("gameID").value);
    const summary = document.getElementById("gameSummary").value;
    const theDate = document.getElementById("gameReleaseDate").value;
    let coverURL = document.getElementById("gameCover").value;

    if (gameName != "" && gameID != "" && rating != "" && summary != "" && theDate != ""){

        //This is used to make the date be in UNIX format, code understood with the aid from:
        //https://stackoverflow.com/questions/11893083/convert-normal-date-to-unix-timestamp
        const theUnixDate = Math.floor(new Date(theDate).getTime() / 1000);

        if (coverURL == ""){
            //Image retrieved from a royalty free website: https://pixabay.com/vectors/question-mark-question-1750942/
            coverURL = "//cdn.pixabay.com/photo/2016/10/18/18/19/question-mark-1750942_960_720.png"
            //This is used as a default image if none is provided.
        }
        
        //JSON format for the newly created game.
        const myNewGame = {
            id: gameID,
            cover: {
                id: 123,
                url: coverURL
            },
            first_release_date: theUnixDate,
            genres: [
                {
                    id: 412,
                    name: "Custom_Game"
                }
            ],
            name: gameName,
            rating: rating,
            summary: summary, 
            playState: "Not Played"
        };

        await addToWishlist(myNewGame);
    }else{
        alert("Please fill the entire form before submitting");
    }

}

//Adds a new game to the wishlist JSON
async function addToWishlist(game) {

    const currentGames = await fetchWishlist();
    const gameID = game.id;

    //Checking if a game is already on the wishlist.
    for (let i = 0; i < currentGames.length; i++){
        currentGame = currentGames[i];
        if (currentGame.id == gameID){
            alert(`${game.name} is already on your wishlist or has the same ID!`)
            return;
        }
    }

    const gameWithExtras = {

        id: game.id,
        cover: game.cover,
        first_release_date: game.first_release_date,
        genres: game.genres,
        name: game.name,
        rating: game.rating,
        summary: game.summary,
        playState: "Not Played"
    };


    try {
        const response = await fetch(
            "/wishlist",
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(gameWithExtras)
            }
        );
        const data = await response.json();
        console.log('Game added to wishlist:', data);
        alert(`${game.name} has been added to your wishlist!`);
    } catch (err) {
            console.error("Error fetching games:", err);
    }
}

//Updates a game's properties
async function updateWishlist(updatedGame) {
    try {
        const response = await fetch(`/wishlist/${updatedGame.id}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedGame)
        });

        const data = await response.json();
        //alert('Game updated successfully!');
        console.log('Updated game:', data);
            
    } catch (error) {
        console.error('Error updating game:', error);
    }
}

//Sends the game to be removed from the wishlist
async function removeFromWishlist(game) {
    const gameId = game.id;
    try {
        const response = await fetch(
            `/wishlist/${gameId}`,
            {
                method: 'DELETE',
            }
        );
        console.log('Game deleted from wishlist:', game.name);
        alert(`${game.name} has been deleted from your wishlist!`);
        
        wishListPopulation();
    } catch (err) {
            console.error("Error fetching games:", err);
    }
}

//This function is used to get the JSON of wishlisted games to later populate the page with
async function fetchWishlist() {
    try {
        const response = await fetch('/wishlist');
        const wishlist = await response.json();
        return wishlist; 
    } catch (error) {
            console.error('Error fetching wishlist:', error);
    }
}


function formSubmission(){
    const userName = document.getElementById("name").value;
    const userEmail = document.getElementById("email").value;
    const userMessage = document.getElementById("message").value;

    if(userName != "" && userEmail != "" && userMessage != ""){
        alert("We got your message! we will be in touch as soon as possible.");
    }else{
        alert("Please fill the entire form before submitting");
    }
}


