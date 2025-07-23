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

    function initialize() {
        moodButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mood = button.dataset.mood;
                const { genres, keywords } = moodGenreMapping[mood];
                if (genres && genres.length > 0) {
                    findMoviesByGenre(genres, mood);
                } else {
                    movieRecommendations.innerHTML = `<p>No genres found for the mood: ${mood}.</p>`;
                }
            });
        });

        loadHistory();
    }

    async function findMoviesByGenre(genres, mood) {
        const tmdbGenreIds = genres.map(genre => tmdbGenreMap[genre]).filter(id => id !== undefined);
        console.log('Selected genres:', genres);
        console.log('Mapped TMDB Genre IDs:', tmdbGenreIds);

        if (tmdbGenreIds.length === 0) {
            movieRecommendations.innerHTML = `<p>No matching TMDB genres found for the mood: ${mood}.</p>`;
            return;
        }

        const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${tmdbGenreIds.join('|')}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;
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
                        return fetch(`http://www.omdbapi.com/?apikey=${omdbApiKey}&i=${movie.imdb_id}&type=movie`).then(res => res.json());
                    } else if (movie.title) {
                        // Try searching by title and year if imdb_id is missing
                        const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
                        const omdbSearchUrl = `http://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(movie.title)}&y=${year}&type=movie`;
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

                if (validOmdbMovies.length > 0) {
                    displayMovies(validOmdbMovies);
                    addToHistory(mood, genres.join(', '));
                } else {
                    movieRecommendations.innerHTML = `<p>Could not find detailed movie information for the mood: ${mood}. Please try another.</p>`;
                }
            } else {
                movieRecommendations.innerHTML = `<p>Could not find movies for the mood: ${mood}. Please try another.</p>`;
            }
        } catch (error) {
            console.error('Error fetching movies from TMDB:', error);
            movieRecommendations.innerHTML = `<p>An error occurred while fetching movies. Please try again later.</p>`;
        }
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