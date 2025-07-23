const omdbApiKey = 'f5dad388'; // OMDB API key
const tmdbApiKey = 'ba418d5a2506d1fa6cf6d157fc902ded'; // TMDB API key

// TMDB Genre mapping (hardcoded for now based on fetched genres)
const tmdbGenreMap = {
    "Action": 28,
    "Adventure": 12,
    "Animation": 16,
    "Comedy": 35,
    "Crime": 80,
    "Documentary": 99,
    "Drama": 18,
    "Family": 10751,
    "Fantasy": 14,
    "History": 36,
    "Horror": 27,
    "Music": 10402,
    "Mystery": 9648,
    "Romance": 10749,
    "Science Fiction": 878,
    "TV Movie": 10770,
    "Thriller": 53,
    "War": 10752,
    "Western": 37
};

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

    let currentPage = 1; // Track current page for TMDB API
    let currentMoodGenres = []; // Store genres of the current mood

    // Get sort and filter elements
    const sortBySelect = document.getElementById('sort-by');
    const filterTextInput = document.getElementById('filter-text');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Event Listeners for sort and filter
    sortBySelect.addEventListener('change', applyFiltersAndSort);
    filterTextInput.addEventListener('input', applyFiltersAndSort);
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        findMoviesByGenre(currentMoodGenres, null, currentPage, true); // Pass true to append movies
    });

    function initialize() {
        moodButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const mood = button.dataset.mood;
                const { genres, keywords } = moodGenreMapping[mood];
                if (genres && genres.length > 0) {
                    currentPage = 1; // Reset page for new mood search
                    currentMoodGenres = genres; // Store current genres
                    findMoviesByGenre(genres, mood, currentPage, false); // Pass false to overwrite movies
                } else {
                    movieRecommendations.innerHTML = `<p>No genres found for the mood: ${mood}.</p>`;
                }

                // Also fetch mood-related movies by keywords
                if (keywords && keywords.length > 0) {
                    fetchMoodRelatedMovies(keywords, mood);
                } else {
                    document.getElementById('mood-related-movies-list').innerHTML = ''; // Clear previous picks
                }
            });
        });

        loadHistory();
    }

    async function findMoviesByGenre(genres, mood, page = 1, append = false) {
        const tmdbGenreIds = genres.map(genre => tmdbGenreMap[genre]).filter(id => id !== undefined);
        console.log('Selected genres:', genres);
        console.log('Mapped TMDB Genre IDs:', tmdbGenreIds);

        if (tmdbGenreIds.length === 0) {
            movieRecommendations.innerHTML = `<p>No matching TMDB genres found for the mood: ${mood}. Please try another.</p>`;
            loadMoreBtn.style.display = 'none';
            return;
        }

        const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${tmdbGenreIds.join('|')}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`;
        console.log('TMDB URL:', tmdbUrl);

        try {
            const tmdbResponse = await fetch(tmdbUrl);
            console.log('TMDB Response Status:', tmdbResponse.status, tmdbResponse.statusText);
            const tmdbData = await tmdbResponse.json();
            console.log('TMDB Data:', tmdbData);

            if (tmdbData.results && tmdbData.results.length > 0) {
                // Fetch details for each movie using OMDB API
                const moviePromises = tmdbData.results.slice(0, 10).map(async movie => {
                    if (movie.imdb_id) {
                        return fetch(`https://www.omdbapi.com/?apikey=${omdbApiKey}&i=${movie.imdb_id}&type=movie`).then(res => res.json());
                    } else if (movie.title) {
                        // Try searching by title and year if imdb_id is missing
                        const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
                        const omdbSearchUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(movie.title)}&y=${year}&type=movie`;
                        console.log('OMDB Search URL (by title):', omdbSearchUrl);
                        try {
                            const res = await fetch(omdbSearchUrl);
                            const data = await res.json();
                            if (data.Response === "True") {
                                return data;
                            } else {
                                console.warn('OMDB search by title failed for:', movie.title, data.Error);
                                return null;
                            }
                        } catch (error) {
                            console.error('Error fetching from OMDB by title:', error);
                            return null;
                        }
                    } else {
                        console.warn('TMDB result missing imdb_id and title:', movie);
                        return null;
                    }
                });

                const omdbMovies = (await Promise.all(moviePromises)).filter(movie => movie !== null);
                const validOmdbMovies = omdbMovies.filter(movie => movie.Response === "True");

                if (append) {
                    currentMovies = [...currentMovies, ...validOmdbMovies];
                } else {
                    currentMovies = validOmdbMovies;
                }

                applyFiltersAndSort(); // Display and apply filters/sort
                addToHistory(mood, genres.join(', '));

                // Show load more button if there are more pages
                if (tmdbData.page < tmdbData.total_pages) {
                    loadMoreBtn.style.display = 'block';
                } else {
                    loadMoreBtn.style.display = 'none';
                }

            } else {
                movieRecommendations.innerHTML = `<p>Could not find movies for the mood: ${mood}. Please try another.</p>`;
                loadMoreBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching movies from TMDB:', error);
            movieRecommendations.innerHTML = `<p>An error occurred while fetching movies. Please try again later.</p>`;
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
        // For 'popularity', we'll rely on the initial TMDB sort, or add a custom sort if needed.
        // For now, 'popularity' will just display the order as received from TMDB after filtering.

        displayMovies(filteredMovies);
    }

    async function fetchMoodRelatedMovies(keywords, mood) {
        const moodRelatedMoviesList = document.getElementById('mood-related-movies-list');
        moodRelatedMoviesList.innerHTML = '<p>Searching for mood-related movies...</p>';

        const tmdbKeywordIds = await fetchTMDBKeywordIds(keywords);

        if (tmdbKeywordIds.length === 0) {
            moodRelatedMoviesList.innerHTML = '<p>No matching keywords found for mood-related movies.</p>';
            return;
        }

        const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_keywords=${tmdbKeywordIds.join('|')}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;
        console.log('TMDB Keyword URL:', tmdbUrl);

        try {
            const tmdbResponse = await fetch(tmdbUrl);
            const tmdbData = await tmdbResponse.json();

            if (tmdbData.results && tmdbData.results.length > 0) {
                const moviePromises = tmdbData.results.slice(0, 10).map(async movie => {
                    if (movie.imdb_id) {
                        return fetch(`https://www.omdbapi.com/?apikey=${omdbApiKey}&i=${movie.imdb_id}&type=movie`).then(res => res.json());
                    } else if (movie.title) {
                        const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
                        const omdbSearchUrl = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(movie.title)}&y=${year}&type=movie`;
                        try {
                            const res = await fetch(omdbSearchUrl);
                            const data = await res.json();
                            if (data.Response === "True") {
                                return data;
                            } else {
                                return null;
                            }
                        } catch (error) {
                            console.error('Error fetching from OMDB by title (keywords):', error);
                            return null;
                        }
                    } else {
                        return null;
                    }
                });

                const omdbMovies = (await Promise.all(moviePromises)).filter(movie => movie !== null);
                const validOmdbMovies = omdbMovies.filter(movie => movie.Response === "True");

                displayMoodRelatedMovies(validOmdbMovies);
            } else {
                moodRelatedMoviesList.innerHTML = `<p>No mood-related movies found for the mood: ${mood}.</p>`;
            }
        } catch (error) {
            console.error('Error fetching movies from TMDB by keywords:', error);
            moodRelatedMoviesList.innerHTML = `<p>An error occurred while fetching mood-related movies.</p>`;
        }
    }

    async function fetchTMDBKeywordIds(keywords) {
        const keywordIds = [];
        for (const keyword of keywords) {
            const searchUrl = `https://api.themoviedb.org/3/search/keyword?api_key=${tmdbApiKey}&query=${encodeURIComponent(keyword)}`;
            try {
                const response = await fetch(searchUrl);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    keywordIds.push(data.results[0].id);
                }
            } catch (error) {
                console.error(`Error fetching keyword ID for ${keyword}:`, error);
            }
        }
        return keywordIds;
    }

    function displayMoodRelatedMovies(movies) {
        const moodRelatedMoviesList = document.getElementById('mood-related-movies-list');
        moodRelatedMoviesList.innerHTML = '';

        if (movies.length === 0) {
            moodRelatedMoviesList.innerHTML = '<p>No mood-related movies found.</p>';
            return;
        }

        movies.forEach(movie => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${movie.Title}</span>
                <span class="year">(${movie.Year})</span>
            `;
            listItem.dataset.imdbid = movie.imdbID;
            listItem.addEventListener('click', () => {
                window.location.href = `movie-details.html?imdbID=${movie.imdbID}`;
            });
            moodRelatedMoviesList.appendChild(listItem);
        });
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
});
