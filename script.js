const omdbApiKey = window.OMDB_API_KEY || 'YOUR_OMDB_API_KEY'; // Fallback for local testing
async function fetchOmdbMovieDetails(imdbID, title, year) {
    if (imdbID) {
        const url = `https://www.omdbapi.com/?apikey=${omdbApiKey}&i=${imdbID}&type=movie`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.Response === "True") {
                return data;
            } else {
                console.warn(`OMDB search by IMDb ID failed for ${imdbID}:`, data.Error);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching from OMDB by IMDb ID ${imdbID}:`, error);
            return null;
        }
    } else if (title) {
        const omdbSearchUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(title)}&y=${year}&type=movie`;
        try {
            const res = await fetch(omdbSearchUrl);
            const data = await res.json();
            if (data.Response === "True") {
                return data;
            } else {
                console.warn('OMDB search by title failed for:', title, data.Error);
                return null;
            }
        } catch (error) {
            console.error('Error fetching from OMDB by title:', error);
            return null;
        }
    } else {
        console.warn('No IMDb ID or title provided for OMDB search.');
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
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

    let currentPage = 1; // Track current page for OMDB API
    let currentMoodGenres = []; // Store genres of the current mood
    let displayedMovieIds = new Set(); // Store IMDb IDs of displayed movies to prevent duplicates

    // Get sort and filter elements
    const sortBySelect = document.getElementById('sort-by');
    const filterTextInput = document.getElementById('filter-text');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // General Search elements
    const generalSearchInput = document.getElementById('general-search-input');
    const generalSearchBtn = document.getElementById('general-search-btn');

    // Event Listeners for sort and filter
    sortBySelect.addEventListener('change', applyFiltersAndSort);
    filterTextInput.addEventListener('input', applyFiltersAndSort);
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        findMoviesByGenre(currentMoodGenres, null, currentPage, true); // Pass true to append movies
    });

    // Event Listener for General Search
    generalSearchBtn.addEventListener('click', () => {
        const searchTerm = generalSearchInput.value.trim();
        if (searchTerm) {
            searchAllMovies(searchTerm);
        }
    });

    generalSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = generalSearchInput.value.trim();
            if (searchTerm) {
                searchAllMovies(searchTerm);
            }
        }
    });

    function initialize() {
        moodButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const mood = button.dataset.mood;
                const { genres, keywords } = moodGenreMapping[mood];
                if (genres && genres.length > 0) {
                    currentPage = 1; // Reset page for new mood search
                    currentMoodGenres = genres; // Store current genres
                    displayedMovieIds.clear(); // Clear displayed movies for new mood
                    findMoviesByGenre(genres, mood, currentPage, false); // Pass false to overwrite movies
                } else {
                    movieRecommendations.innerHTML = `<p>No genres found for the mood: ${mood}.</p>`;
                }
            });
        });

        populateCategories();
        loadHistory();
    }

    function populateCategories() {
        const categoryButtonsContainer = document.getElementById('category-buttons');
        const allGenres = new Set();

        for (const mood in moodGenreMapping) {
            moodGenreMapping[mood].genres.forEach(genre => allGenres.add(genre));
        }

        allGenres.forEach(genre => {
            const button = document.createElement('button');
            button.classList.add('category-btn'); // New class for category buttons
            button.textContent = genre;
            button.dataset.genre = genre;
            button.addEventListener('click', () => {
                currentPage = 1;
                currentMoodGenres = [genre]; // Treat single genre as an array for consistency
                displayedMovieIds.clear();
                findMoviesByGenre([genre], genre, currentPage, false); // Pass genre as both genres array and mood for history
            });
            categoryButtonsContainer.appendChild(button);
        });
    }

    async function findMoviesByGenre(genres, mood, page = 1, append = false) {
        if (!append) {
            movieRecommendations.innerHTML = '<p>Loading mood-based movies...</p>';
            loadMoreBtn.style.display = 'none';
        }

        // Use OMDB for genre search (less accurate than TMDB for genre discovery)
        const genreSearchTerm = genres[0]; // Use the first genre as the search term
        const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&s=${encodeURIComponent(genreSearchTerm)}&type=movie&page=${page}`;
        console.log('OMDB Genre Search URL:', omdbUrl);

        try {
            const omdbResponse = await fetch(omdbUrl);
            const omdbData = await omdbResponse.json();

            if (omdbData.Response === "True" && omdbData.Search) {
                const moviePromises = omdbData.Search.map(async movie => {
                    return fetchOmdbMovieDetails(movie.imdbID, movie.Title, movie.Year);
                });

                const omdbMovies = (await Promise.all(moviePromises)).filter(movie => movie !== null);
                const newOmdbMovies = omdbMovies.filter(movie => movie.Response === "True" && !displayedMovieIds.has(movie.imdbID));

                newOmdbMovies.forEach(movie => displayedMovieIds.add(movie.imdbID));

                if (append) {
                    currentMovies = [...currentMovies, ...newOmdbMovies];
                } else {
                    currentMovies = newOmdbMovies;
                }

                applyFiltersAndSort(); // Display and apply filters/sort
                addToHistory(mood, genres.join(', '));

                // OMDB has a totalResults field, but no direct page count. Estimate pages.
                const totalResults = parseInt(omdbData.totalResults);
                const moviesPerPage = omdbData.Search.length; // Assuming 10 movies per page from OMDB
                const totalPages = Math.ceil(totalResults / moviesPerPage);

                if (page < totalPages) {
                    loadMoreBtn.style.display = 'block';
                } else {
                    loadMoreBtn.style.display = 'none';
                }

            } else {
                movieRecommendations.innerHTML = `<p>Could not find movies for the mood: ${mood}. Please try another.</p>`;
                loadMoreBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching movies from OMDB:', error);
            movieRecommendations.innerHTML = '<p>An error occurred while fetching movie recommendations. Please check your internet connection or try again later.</p>';
            loadMoreBtn.style.display = 'none';
        }
    }

    let currentMovies = []; // Store the currently fetched movies

    function displayMovies(moviesToDisplay) {
        if (!moviesToDisplay || moviesToDisplay.length === 0) {
            movieRecommendations.innerHTML = '<p>No movies found matching your criteria.</p>';
            return;
        }

        // Clear only if not appending
        if (currentPage === 1) {
            movieRecommendations.innerHTML = '';
        }

        moviesToDisplay.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <img src="${movie.Poster.replace('http://', 'https://')}" alt="${movie.Title} Poster">
                <h3>${movie.Title}</h3>
                <p>${movie.Year}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
            `;
            movieCard.dataset.imdbid = movie.imdbID; // Store IMDb ID
            movieCard.addEventListener('click', () => {
                window.location.href = `movie-details.html?imdbID=${movie.imdbID}`;
            });
            movieRecommendations.appendChild(movieCard);
        });
    }

    function applyFiltersAndSort() {
        let filteredMovies = [...currentMovies];

        // Apply filter
        const filterText = filterTextInput.value.toLowerCase();
        if (filterText) {
            filteredMovies = filteredMovies.filter(movie =>
                movie.Title.toLowerCase().includes(filterText)
            );
        }

        // Apply sort
        const sortBy = sortBySelect.value;
        if (sortBy === 'title') {
            filteredMovies.sort((a, b) => a.Title.localeCompare(b.Title));
        } else if (sortBy === 'year') {
            filteredMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
        }
        // For 'popularity', we'll rely on the initial OMDB sort, or add a custom sort if needed.
        // For now, 'popularity' will just display the order as received from TMDB after filtering.

        displayMovies(filteredMovies);
    }

    function addToHistory(mood, genres) {
        const historyItem = document.createElement('li');
        const genresString = Array.isArray(genres) ? genres.join(', ') : String(genres);
        historyItem.textContent = `Searched for ${mood} movies (Genres: ${genresString})`;
        historyList.prepend(historyItem);

        // Store in local storage
        let history = JSON.parse(localStorage.getItem('movieHistory')) || [];
        history.unshift({ mood, genres: genresString, date: new Date().toISOString() });
        if (history.length > 5) {
            history.pop();
        }
        localStorage.setItem('movieHistory', JSON.stringify(history));
    }

    function loadHistory() {
        let history = JSON.parse(localStorage.getItem('movieHistory')) || [];
        history.forEach(item => {
            const historyItem = document.createElement('li');
            historyItem.textContent = `Searched for ${item.mood} movies (Genres: ${item.genres})`;
            historyList.appendChild(historyItem);
        });
    }

    async function searchAllMovies(searchTerm) {
        movieRecommendations.innerHTML = '<p>Searching for movies...</p>';
        loadMoreBtn.style.display = 'none';
        currentMovies = []; // Clear current mood-based movies
        displayedMovieIds.clear(); // Clear displayed movies for new search

        try {
            const omdbSearchUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&s=${encodeURIComponent(searchTerm)}&type=movie`;
            const response = await fetch(omdbSearchUrl);
            const data = await response.json();

            if (data.Response === "True" && data.Search) {
                const moviePromises = data.Search.map(async movie => {
                    return fetchOmdbMovieDetails(movie.imdbID, movie.Title, movie.Year);
                });

                const omdbMovies = (await Promise.all(moviePromises)).filter(movie => movie !== null);
                const newOmdbMovies = omdbMovies.filter(movie => movie.Response === "True" && !displayedMovieIds.has(movie.imdbID));

                newOmdbMovies.forEach(movie => displayedMovieIds.add(movie.imdbID));

                currentMovies = newOmdbMovies;
                applyFiltersAndSort();
            } else {
                movieRecommendations.innerHTML = `<p>No movies found for "${searchTerm}".</p>`;
            }
        } catch (error) {
            console.error('Error searching all movies:', error);
            movieRecommendations.innerHTML = '<p>An error occurred while searching for movies. Please check your internet connection or try again later.</p>';
        }
    }
});
