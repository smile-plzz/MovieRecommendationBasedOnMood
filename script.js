document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const movieRecommendations = document.getElementById('movie-recommendations');
    const historyList = document.getElementById('history-list');
    let moodGenreMapping = {};

    // Fetch mood-genre mapping from config.json
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            moodGenreMapping = data.moodGenreMapping;
            initialize();
        })
        .catch(error => {
            console.error('Error fetching config:', error);
            movieRecommendations.innerHTML = `<p>Could not load mood configurations. Please try again later.</p>`;
        });

    function initialize() {
        moodButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mood = button.dataset.mood;
                const genres = moodGenreMapping[mood];
                if (genres && genres.length > 0) {
                    const genre = genres[Math.floor(Math.random() * genres.length)];
                    fetchMovies(genre, mood);
                } else {
                    movieRecommendations.innerHTML = `<p>No genres found for the mood: ${mood}.</p>`;
                }
            });
        });

        loadHistory();
    }

    function fetchMovies(genre, mood) {
        const apiKey = '1a9ba4f'; // Replace with your OMDB API key
        const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${genre}&type=movie`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.Response === "True") {
                    displayMovies(data.Search);
                    addToHistory(mood, genre);
                } else {
                    movieRecommendations.innerHTML = `<p>Could not find movies for the mood: ${mood}. Please try another.</p>`;
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                movieRecommendations.innerHTML = `<p>An error occurred while fetching movies. Please try again later.</p>`;
            });
    }

    function displayMovies(movies) {
        movieRecommendations.innerHTML = '';
        const randomMovies = movies.sort(() => 0.5 - Math.random()).slice(0, 5);
        randomMovies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title} Poster">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
            `;
            movieRecommendations.appendChild(movieCard);
        });
    }

    function addToHistory(mood, genre) {
        const historyItem = document.createElement('li');
        historyItem.textContent = `Searched for ${mood} movies (Genre: ${genre})`;
        historyList.prepend(historyItem);

        // Store in local storage
        let history = JSON.parse(localStorage.getItem('movieHistory')) || [];
        history.unshift({ mood, genre, date: new Date().toISOString() });
        if (history.length > 5) {
            history.pop();
        }
        localStorage.setItem('movieHistory', JSON.stringify(history));
    }

    function loadHistory() {
        let history = JSON.parse(localStorage.getItem('movieHistory')) || [];
        history.forEach(item => {
            const historyItem = document.createElement('li');
            historyItem.textContent = `Searched for ${item.mood} movies (Genre: ${item.genre})`;
            historyList.appendChild(historyItem);
        });
    }
});