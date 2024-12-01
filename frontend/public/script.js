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


function populateDiv(receivedGames, divToPopulate){
  const gameContainer = document.getElementById(divToPopulate);
  gameContainer.innerHTML = '';

  for (var i = 0; i < receivedGames.length; i++ ){

    var game = receivedGames[i];

    const gameCard = document.createElement('div');
    gameCard.classList.add('miniGame');

    // Game cover image
    const gameImage = document.createElement('img');
    gameImage.src = `https:${game.cover.url}`; // Image wont show if not in this format.
    gameImage.alt = game.name;

    // Game title
    const gameTitle = document.createElement('h3');
    gameTitle.textContent = game.name;

    // Game summary - Too long for small div some times
    // const gameSummary = document.createElement('p');
    // gameSummary.textContent = game.summary;

    // Game release date convert from Unix timestamp - This is necessary because the DB only returns date in that format
    let releaseDate;
    if (game.first_release_date) {
        releaseDate = new Date(game.first_release_date * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } else {
        releaseDate = 'Unknown Release Date';
    }
    const releaseDateElement = document.createElement('p');
    releaseDateElement.textContent = `Release Date: ${releaseDate}`;

    // Game rating (if available)
    let gameRating;
    if (game.rating) {
        gameRating = `Rating: ${game.rating.toFixed(1)}`; // Show one decimal place
    } else {
        gameRating = 'Rating: Not Available';
    }
    const ratingElement = document.createElement('p');
    ratingElement.textContent = gameRating;

    // Game genres - Not sure how to get actual Strings yet
    let genres;
    if (game.genres && game.genres.length > 0) {
        genres = `Genres: ${game.genres.join(', ')}`;
    } else {
        genres = 'Genres: Not Available';
    }
    const genresElement = document.createElement('p');
    genresElement.textContent = genres;

    // Append elements to the game card
    gameCard.appendChild(gameImage);
    gameCard.appendChild(gameTitle);
    // gameCard.appendChild(gameSummary);
    gameCard.appendChild(releaseDateElement);
    gameCard.appendChild(ratingElement);
    gameCard.appendChild(genresElement);
    gameCard.addEventListener('click', () => openModal(game));

    // Append the game card to the container
    gameContainer.appendChild(gameCard);

  }
}










//----------------------------------------------------------------------------------

function openModal(game) {
  const modal = document.getElementById('gameModal');

  // Populate modal content
  document.getElementById('modalGameTitle').textContent = game.name;
  document.getElementById('modalGameImage').src = `https:${game.cover.url}`;
  document.getElementById('modalGameSummary').textContent = `Summary: ${game.summary}`;
  
  const releaseDate = game.first_release_date
      ? new Date(game.first_release_date * 1000).toLocaleDateString()
      : 'Unknown Release Date';
  document.getElementById('modalGameReleaseDate').textContent = `Release Date: ${releaseDate}`;

  document.getElementById('modalGameRating').textContent = game.rating
      ? `Rating: ${game.rating.toFixed(1)}`
      : 'Rating: Not Available';

  document.getElementById('modalGameGenres').textContent = `Genres: ${game.genres.join(', ')}`;

  // Show the modal
  modal.style.display = 'block';

  // Add event listener to the "Add to Wishlist" button
  const addToWishlistButton = document.getElementById('addToWishlistButton');
  addToWishlistButton.onclick = () => addToWishlist(game);
}

async function indexPopulation(){
  const pcGames = await fetchPlatform(6);
  const ps5Games = await fetchPlatform(167);
  
  populateDiv(pcGames, "PCGamesDiv")
  populateDiv(ps5Games, "PS5GamesDiv")

}

async function servicePopulation(){
  const pcGames = await fetchPlatform(6);
  populateDiv(pcGames, "PCGamesDiv")

  const ps5Games = await fetchPlatform(167);
  populateDiv(ps5Games, "PS5GamesDiv")

  const xboxGames = await fetchPlatform(6);
  populateDiv(xboxGames, "xboxGamesDiv")

  const SwitchGames = await fetchPlatform(130);
  populateDiv(SwitchGames, "SwitchGamesDiv")
}
