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
    const selectionSummary = document.getElementById('selection-summary');
    const statusMessage = document.getElementById('status-message');
    const resultCountBadge = document.getElementById('result-count-badge');
    const clearResultsBtn = document.getElementById('clear-results-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    let activeMoodButton = null;
    let activeCategoryButton = null;
    let lastSelection = { type: 'none', label: '' };
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
            movieRecommendations.innerHTML = `<p class="empty-state">Could not load mood configurations. Please try again later.</p>`;
            updateStatus('We couldn’t load the mood presets. Refresh the page to try again.', 'error');
        });

    let currentPage = 1; // Track current page for OMDB API
    let currentMoodGenres = []; // Store genres of the current mood
    let currentMoodKey = null; // Track the active mood key for keyword blending
    let displayedMovieIds = new Set(); // Store IMDb IDs of displayed movies to prevent duplicates

    // Get sort and filter elements
    const sortBySelect = document.getElementById('sort-by');
    const filterTextInput = document.getElementById('filter-text');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // General Search elements
    const generalSearchInput = document.getElementById('general-search-input');
    const generalSearchBtn = document.getElementById('general-search-btn');

    movieRecommendations.innerHTML = '<p class="empty-state">Pick a mood or search to see personalized recommendations.</p>';
    updateStatus('Awaiting your first selection.');
    updateResultCount(0);
    setLastSelection('none', '');

    // Event Listeners for sort and filter
    sortBySelect.addEventListener('change', applyFiltersAndSort);
    filterTextInput.addEventListener('input', applyFiltersAndSort);
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        const label = lastSelection.label || (currentMoodGenres[0] || 'selection');
        findMoviesByGenre(currentMoodGenres, label, currentPage, true, currentMoodKey); // Pass true to append movies
    });

    clearResultsBtn.addEventListener('click', () => {
        clearResults();
        updateStatus('Results cleared. Choose a new mood or try a quick search.', 'info');
    });

    resetFiltersBtn.addEventListener('click', () => {
        sortBySelect.value = 'popularity';
        filterTextInput.value = '';
        applyFiltersAndSort();
        updateStatus('Filters reset. Showing the original order of your latest selection.', 'info');
    });

    // Event Listener for General Search
    generalSearchBtn.addEventListener('click', () => {
        const searchTerm = generalSearchInput.value.trim();
        if (searchTerm) {
            resetActiveStates();
            currentMoodKey = null;
            currentMoodGenres = [];
            setLastSelection('search', searchTerm);
            updateStatus(`Searching for "${searchTerm}"...`, 'loading');
            searchAllMovies(searchTerm);
        }
    });

    generalSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = generalSearchInput.value.trim();
            if (searchTerm) {
                resetActiveStates();
                currentMoodKey = null;
                currentMoodGenres = [];
                setLastSelection('search', searchTerm);
                updateStatus(`Searching for "${searchTerm}"...`, 'loading');
                searchAllMovies(searchTerm);
            }
        }
    });

    function initialize() {
        moodButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const mood = button.dataset.mood;
                const { genres } = moodGenreMapping[mood];
                if (genres && genres.length > 0) {
                    setActiveMood(button);
                    setLastSelection('mood', mood);
                    updateStatus(`Fetching top picks for a ${mood.toLowerCase()} mood...`, 'loading');
                    currentPage = 1; // Reset page for new mood search
                    currentMoodGenres = genres; // Store current genres
                    currentMoodKey = mood;
                    displayedMovieIds.clear(); // Clear displayed movies for new mood
                    findMoviesByGenre(genres, mood, currentPage, false, mood); // Pass false to overwrite movies
                } else {
                    movieRecommendations.innerHTML = `<p class="empty-state">No genres found for the mood: ${mood}.</p>`;
                    updateStatus(`No genres configured for the mood "${mood}".`, 'warning');
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
                setActiveCategory(button);
                setLastSelection('category', genre);
                updateStatus(`Exploring movies in the ${genre} category...`, 'loading');
                currentPage = 1;
                currentMoodGenres = [genre]; // Treat single genre as an array for consistency
                currentMoodKey = null;
                displayedMovieIds.clear();
                findMoviesByGenre([genre], genre, currentPage, false, null); // Pass genre as both genres array and mood for history
            });
            categoryButtonsContainer.appendChild(button);
        });
    }

    const MAX_GENRE_TERMS = 3;
    const MAX_KEYWORD_TERMS = 2;

    function getSearchTerms(genres, moodKey) {
        const uniqueGenres = Array.from(new Set(genres));
        const primaryGenres = uniqueGenres.slice(0, MAX_GENRE_TERMS);
        const keywords = moodKey && moodGenreMapping[moodKey]?.keywords
            ? moodGenreMapping[moodKey].keywords.slice(0, MAX_KEYWORD_TERMS)
            : [];
        return Array.from(new Set([...primaryGenres, ...keywords])).filter(Boolean);
    }

    async function searchOmdbByTerm(term, pageNumber) {
        const url = `https://www.omdbapi.com/?apikey=${omdbApiKey}&s=${encodeURIComponent(term)}&type=movie&page=${pageNumber}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.Response === "True" && data.Search) {
            return {
                movies: data.Search,
                totalResults: parseInt(data.totalResults, 10) || data.Search.length
            };
        }
        return { movies: [], totalResults: 0 };
    }

    async function findMoviesByGenre(genres, mood, page = 1, append = false, moodKey = null) {
        if (!append) {
            movieRecommendations.innerHTML = '<p class="empty-state">Loading mood-based movies...</p>';
            loadMoreBtn.style.display = 'none';
        }

        const searchTerms = getSearchTerms(genres, moodKey);
        if (searchTerms.length === 0) {
            movieRecommendations.innerHTML = '<p class="empty-state">No search terms available for this mood yet.</p>';
            updateStatus('We could not determine the right keywords for this mood. Try another selection.', 'warning');
            updateResultCount(0);
            return;
        }

        try {
            const searchResults = await Promise.all(searchTerms.map(term => searchOmdbByTerm(term, page)));
            const aggregatedMovies = searchResults.flatMap(result => result.movies);

            const uniqueSearchMovies = aggregatedMovies.filter(movie => {
                const isNew = movie?.imdbID && !displayedMovieIds.has(movie.imdbID);
                if (isNew) {
                    displayedMovieIds.add(movie.imdbID);
                }
                return isNew;
            });

            if (uniqueSearchMovies.length === 0 && append) {
                updateStatus('You have seen all results that match this mood.', 'warning');
                loadMoreBtn.style.display = 'none';
                return;
            }

            if (uniqueSearchMovies.length === 0) {
                movieRecommendations.innerHTML = `<p class="empty-state">Could not find movies for ${mood || 'this selection'}. Please try another.</p>`;
                updateResultCount(0);
                updateStatus(`No results found for "${mood || 'this selection'}". Try a different mood or search term.`, 'warning');
                loadMoreBtn.style.display = 'none';
                return;
            }

            const moviePromises = uniqueSearchMovies.map(async movie => {
                return fetchOmdbMovieDetails(movie.imdbID, movie.Title, movie.Year);
            });

            const detailedMovies = (await Promise.all(moviePromises)).filter(movie => movie && movie.Response === "True");

            if (append) {
                const deduped = detailedMovies.filter(movie => !currentMovies.some(existing => existing.imdbID === movie.imdbID));
                currentMovies = [...currentMovies, ...deduped];
            } else {
                currentMovies = detailedMovies;
            }

            applyFiltersAndSort(); // Display and apply filters/sort
            if (!append && mood) {
                addToHistory(mood, genres.join(', '));
            }

            const hasMoreResults = searchResults.some(result => {
                const total = result.totalResults;
                if (!total) return false;
                return page * 10 < total;
            });

            loadMoreBtn.style.display = hasMoreResults ? 'block' : 'none';
        } catch (error) {
            console.error('Error fetching movies from OMDB:', error);
            movieRecommendations.innerHTML = '<p class="empty-state">An error occurred while fetching movie recommendations. Please check your internet connection or try again later.</p>';
            updateStatus('We ran into an issue while loading your recommendations. Please try again in a moment.', 'error');
            loadMoreBtn.style.display = 'none';
        }
    }

    let currentMovies = []; // Store the currently fetched movies

    function displayMovies(moviesToDisplay) {
        movieRecommendations.innerHTML = '';

        if (!moviesToDisplay || moviesToDisplay.length === 0) {
            movieRecommendations.innerHTML = '<p class="empty-state">No movies found matching your current filters. Try adjusting or pick another mood.</p>';
            return;
        }

        moviesToDisplay.forEach(movie => {
            const posterUrl = movie.Poster && movie.Poster !== 'N/A'
                ? movie.Poster.replace('http://', 'https://')
                : 'https://via.placeholder.com/300x450/1e1e1e/ffffff?text=No+Image';
            const plotSnippet = movie.Plot && movie.Plot !== 'N/A'
                ? `${movie.Plot.split('. ').slice(0, 2).join('. ')}.`
                : 'A surprise awaits—open the details for the full synopsis.';
            const ratingText = movie.imdbRating && movie.imdbRating !== 'N/A' ? `${movie.imdbRating}/10 IMDb` : 'Not rated yet';
            const primaryGenre = movie.Genre ? movie.Genre.split(',')[0] : 'Genre TBD';

            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.innerHTML = `
                <div class="movie-card__poster">
                    <img src="${posterUrl}" alt="${movie.Title} poster">
                    <span class="movie-card__badge">${primaryGenre}</span>
                </div>
                <div class="movie-card__body">
                    <h3>${movie.Title}</h3>
                    <p class="movie-card__plot">${plotSnippet}</p>
                </div>
                <div class="movie-card__meta">
                    <span class="movie-card__rating">⭐ ${ratingText}</span>
                    <span class="movie-card__year">${movie.Year}</span>
                    <button class="movie-card__cta" type="button">Details</button>
                </div>
            `;
            movieCard.dataset.imdbid = movie.imdbID; // Store IMDb ID
            movieCard.setAttribute('role', 'listitem');
            movieCard.setAttribute('tabindex', '0');
            movieCard.setAttribute('aria-label', `${movie.Title} released in ${movie.Year}`);

            const navigateToDetails = () => {
                window.location.href = `movie-details.html?imdbID=${movie.imdbID}`;
            };

            movieCard.addEventListener('click', navigateToDetails);
            movieCard.addEventListener('keypress', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigateToDetails();
                }
            });
            const ctaButton = movieCard.querySelector('.movie-card__cta');
            if (ctaButton) {
                ctaButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    navigateToDetails();
                });
            }
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
        updateMetrics(filteredMovies);
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
        movieRecommendations.innerHTML = '<p class="empty-state">Searching for movies...</p>';
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
                movieRecommendations.innerHTML = `<p class="empty-state">No movies found for "${searchTerm}".</p>`;
                updateResultCount(0);
                updateStatus(`We couldn’t find matches for "${searchTerm}". Try another title or pick a mood.`, 'warning');
            }
        } catch (error) {
            console.error('Error searching all movies:', error);
            movieRecommendations.innerHTML = '<p class="empty-state">An error occurred while searching for movies. Please check your internet connection or try again later.</p>';
            updateStatus('Something went wrong while searching. Please try again shortly.', 'error');
        }
    }

    function setActiveMood(button) {
        if (activeMoodButton) {
            activeMoodButton.classList.remove('active');
        }
        if (activeCategoryButton) {
            activeCategoryButton.classList.remove('active');
            activeCategoryButton = null;
        }
        button.classList.add('active');
        activeMoodButton = button;
    }

    function setActiveCategory(button) {
        if (activeCategoryButton) {
            activeCategoryButton.classList.remove('active');
        }
        if (activeMoodButton) {
            activeMoodButton.classList.remove('active');
            activeMoodButton = null;
        }
        button.classList.add('active');
        activeCategoryButton = button;
    }

    function resetActiveStates() {
        if (activeMoodButton) {
            activeMoodButton.classList.remove('active');
            activeMoodButton = null;
        }
        if (activeCategoryButton) {
            activeCategoryButton.classList.remove('active');
            activeCategoryButton = null;
        }
    }

    function setLastSelection(type, label) {
        lastSelection = { type, label };
        if (type === 'mood') {
            updateSelectionSummary(`Mood selected: ${label}`);
        } else if (type === 'category') {
            updateSelectionSummary(`Browsing the ${label} category`);
        } else if (type === 'search') {
            updateSelectionSummary(`Search results for "${label}"`);
        } else {
            updateSelectionSummary('Pick a mood to get started.');
        }
    }

    function updateSelectionSummary(text) {
        if (selectionSummary) {
            selectionSummary.textContent = text;
        }
    }

    function updateStatus(message, tone = 'info') {
        if (!statusMessage) return;
        statusMessage.textContent = message;
        statusMessage.classList.remove('success', 'warning', 'error', 'loading');
        if (tone !== 'info') {
            statusMessage.classList.add(tone);
        }
    }

    function updateResultCount(count) {
        if (!resultCountBadge) return;
        const label = count === 1 ? 'result' : 'results';
        resultCountBadge.textContent = `${count} ${label}`;
    }

    function updateMetrics(filteredMovies) {
        const count = filteredMovies.length;
        updateResultCount(count);

        if (count === 0) {
            updateStatus('No movies match your current filters. Try adjusting them or pick another mood.', 'warning');
            return;
        }

        let descriptor = 'based on your selection';
        if (lastSelection.type === 'mood') {
            descriptor = `for the mood "${lastSelection.label}"`;
        } else if (lastSelection.type === 'category') {
            descriptor = `in the ${lastSelection.label} category`;
        } else if (lastSelection.type === 'search') {
            descriptor = `for "${lastSelection.label}"`;
        }

        updateStatus(`Showing ${count} ${count === 1 ? 'movie' : 'movies'} ${descriptor}.`, 'success');
    }

    function clearResults() {
        currentMovies = [];
        displayedMovieIds.clear();
        currentMoodKey = null;
        currentMoodGenres = [];
        resetActiveStates();
        setLastSelection('none', '');
        movieRecommendations.innerHTML = '<p class="empty-state">Pick a mood or search to see personalized recommendations.</p>';
        updateResultCount(0);
        loadMoreBtn.style.display = 'none';
        filterTextInput.value = '';
        sortBySelect.value = 'popularity';
        generalSearchInput.value = '';
    }
});
