async function fetchPlatform(platformID) {
  try {
      const response = await fetch(`http://localhost:3000/gamesByPlatform?search=${platformID}`);
      const gamesByPlatform = await response.json(); // Parse the response as JSON
      if (gamesByPlatform.length === 0) {
        console.log('No games found or data is not an array.');
        return; 
    }
      console.log(gamesByPlatform[0].name); 
      return gamesByPlatform;
  } catch (error) {
      console.error('Error fetching games:', error);
  }
}

async function searchGame(gameName) {
  try {
      const response = await fetch(`http://localhost:3000/searchGame?search=${gameName}`);
      const searchedGames = await response.json(); // Parse the response as JSON
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

async function searchBar() {
  var theGame = document.getElementById("findText").value;
  searchedGame =  await searchGame(theGame);
  populateDiv(searchedGame, "searchedGames");
}

async function indexPopulation(){
  const pcGames = await fetchPlatform(6);
  populateDiv(pcGames, "PCGamesDiv")

  const ps5Games = await fetchPlatform(167);
  populateDiv(ps5Games, "PS5GamesDiv")
}
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

async function wishListPopulation() {
  const wishedGames = await fetchWishlist();
  populateDiv(wishedGames,"WishlistGames")
}

function populateDiv(receivedGames, divToPopulate) {
  let isPopUp = false;
  let isWishList = false;
  //If a game is clicked, the PopUpGamesDiv will always be the Div
  if (divToPopulate === "PopUpGamesDiv") {
    isPopUp = true;
  }else if(divToPopulate === "WishlistGames"){
    isWishList = true;
  }

  const gameContainer = document.getElementById(divToPopulate);

  gameContainer.innerHTML = ''; // Clear existing content

  for (let i = 0; i < receivedGames.length; i++) {
    const game = receivedGames[i];

    const gameCard = document.createElement('div');

    gameCard.dataset.game = JSON.stringify(game);
    //Add the entire game data to the DIV itself so it can be called later and added to the wishlist JSON file. 

    //--------- Game card population area -------- 
    
    //Cover image
    const gameImage = document.createElement('img');
    gameImage.src = `https:${game.cover.url}`; // Ensure URL format
    gameImage.alt = game.name;

    //Game title
    const gameTitle = document.createElement('h3');
    gameTitle.textContent = game.name;

    //Game release date
    const releaseDateElement = document.createElement('p');
    if (game.first_release_date) {
      const releaseDate = new Date(game.first_release_date * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',//The game has to be converted to regular date format since it is in Unix Time Stamp format.
        day: 'numeric',
      });
      releaseDateElement.textContent = `Release Date: ${releaseDate}`;
    } else {
      releaseDateElement.textContent = 'Release Date: Unknown';
    }

    //Game rating
    const ratingElement = document.createElement('p');
    if (game.rating) {
      ratingElement.textContent = `Rating: ${game.rating.toFixed(1)}`; // Show one decimal
    } else {
      ratingElement.textContent = 'Rating: Not Available';
    }

    //Game genres
    const genresElement = document.createElement('p');
    if (game.genres && game.genres.length > 0) {
      genresElement.textContent = `Genres: ${game.genres.map(genre => genre.name).join(', ')}`;
      //Genres have to be extracted from the json since the database gives us an ID for each genre as well, I really don't know why we need ID for this...
    } else {
      genresElement.textContent = 'Genres: Not Available';
    }
   
    //Common gameCard elements 
    gameCard.appendChild(gameImage);
    gameCard.appendChild(gameTitle);
    gameCard.appendChild(releaseDateElement);
    gameCard.appendChild(ratingElement);
    gameCard.appendChild(genresElement);

    if (isPopUp) {
      //If it is a PopUp (When a game is clicked to te able to see the full game details)
      gameCard.classList.add('miniPopUpGame');
      //Add a different class so it doesnt collide with the miniGame class
      const gameSummary = document.createElement('p');


      //CHECK THIS CODE BETTER IT LOOKS PRETTY DAMN UGLY!!!!!!!!!!!!!!!!!!!!!!!!!
      let truncatedSummary = game.summary.split(' ').slice(0, 60).join(' ');

      if (game.summary){
        if (game.summary.split(' ').length > 60) {
          truncatedSummary += '...';
        }
        gameSummary.textContent = truncatedSummary;
      }else{
        gameSummary.textContent = "No summary available.";
      }
      gameCard.appendChild(gameSummary);
      
      //Exclusive button to close the div when clicked
      const closeButton = document.createElement("button");
      closeButton.textContent = 'Close';
      closeButton.classList.add('closeButton');
      closeButton.onclick = () => {
        gameContainer.style.display = 'none'; // Hide the pop-up
        gameContainer.innerHTML = ''; // Clear the content
      };

      gameCard.appendChild(closeButton);
      gameContainer.style.display = 'block';


      const wishlistButton = document.createElement("button");
      wishlistButton.textContent = "Add to wish list";
      wishlistButton.classList.add('closeButton');
      //FIX WISHLIST BUTTON
      wishlistButton.addEventListener('click', () => {
        addToWishlist(game);
      });      
      gameCard.appendChild(wishlistButton);

    } else if (isWishList){
      gameCard.classList.add('wishGames');
      //Add the popUp Function and add miniGame class if not a popUp item

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Remove from wishlist";
      deleteButton.classList.add('closeButton');
      //FIX WISHLIST BUTTON
      deleteButton.addEventListener('click', () => {
        removeFromWishlist(game);
      });      
      gameCard.appendChild(deleteButton);

    } else {
      gameCard.classList.add('miniGame');
      //Add the popUp Function and add miniGame class if not a popUp item
      gameCard.addEventListener('click', (event) => popUpGame(event));
    }

    gameContainer.appendChild(gameCard);
  }
}

function popUpGame(event) {
  //retrieved from - https://www.w3schools.com/js/js_events.asp
  if (!event || !event.currentTarget) {
    console.error("Event or currentTarget is undefined.");
    return;
  }
  const game = JSON.parse(event.currentTarget.dataset.game);
  //This adds the game Info to the populateDiv funciton for it to fill a div that appears on demand as a pop up.
  populateDiv([game], "PopUpGamesDiv"); 
}

async function addToWishlist(game) {

  const currentGames = await fetchWishlist();
  const gameID = game.id;

  //Checking if a game is already on the wishlist.
  for (let i = 0; i < currentGames.length; i++){
    currentGame = currentGames[i];
    if (currentGame.id == gameID){
      alert(`${game.name} is already on your wishlist!`)
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
      rank: 1,
      playState: "Not Played"
  };


  try {
    const response = await fetch(
        "http://localhost:3000/wishlist",
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

async function removeFromWishlist(game) {
  const gameId = game.id;
  try {
    
    const response = await fetch(
        `http://localhost:3000/wishlist/${gameId}`,
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


async function fetchWishlist() {
  try {
      const response = await fetch('http://localhost:3000/wishlist'); // Make GET request
      const wishlist = await response.json(); // Parse the response as JSON
      return wishlist; 
  } catch (error) {
      console.error('Error fetching wishlist:', error);
  }
}