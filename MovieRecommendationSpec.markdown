# Movie Recommendation Based on Mood - Project Specification

## 1. Project Overview
The Movie Recommendation Based on Mood application is a web-based platform that suggests movies to users based on their current emotional state. The application leverages the OMDB API to fetch movie data and is designed for live deployment using Git for version control, ensuring no reliance on local servers.

## 2. Functional Requirements

### 2.1 User Interface
- **Mood Selection**: Users can select their current mood from a predefined list (e.g., Happy, Sad, Excited, Relaxed) via a dropdown or button interface.
- **General Movie Search**: A dedicated search bar allows users to search for movies by title, independent of mood.
- **Movie Recommendations**: Displays a list of movie recommendations with title, poster, year, genre, and a brief plot summary.
- **Enhanced Movie Details Page**: Provides comprehensive movie information including ratings (IMDb, Rotten Tomatoes, Metacritic), Metascore, IMDb Votes, DVD release date, Production company, and Website. Features a modern design with improved typography and subtle animations.
- **Share Functionality**: Allows users to easily share movie details links.
- **Add to Favorites/Watchlist**: Users can save movies to a local storage-based favorites list.
- **Search History**: Stores user’s recent mood-based searches in the browser’s local storage (no server-side storage).
- **Responsive Design**: The application must be fully responsive for desktop and mobile devices.

### 2.2 Core Features
- **Mood-Based Filtering**: Maps moods to specific movie genres or keywords. Recommendations are fetched using OMDB's search endpoint.
- **OMDB API Integration**: Fetches movie data using the OMDB API based on mood-genre mappings and general search queries.
- **Randomized Suggestions**: Provides a randomized selection of movies within the chosen genre to enhance variety.
- **Duplicate Prevention**: Ensures no duplicate movies are recommended or displayed.
- **Error Handling**: Displays user-friendly error messages for API failures or invalid inputs.

### 2.3 Non-Functional Requirements
- **Deployment**: The application must be deployable to a static hosting service (e.g., GitHub Pages, Netlify, or Vercel) using Git for version control.
- **No Local Server**: All functionality must be client-side, using browser-based technologies.
- **Performance**: API calls should be optimized to minimize latency, with results displayed within 2 seconds under normal network conditions. Caching is implemented via Service Workers.
- **Security**: Securely handles API keys by setting them as global JavaScript variables in `index.html` and `movie-details.html`.

## 3. API Integration
- **API**: OMDB API (TMDB API usage has been removed).
- **Endpoint**: `http://www.omdbapi.com/?apikey=[YOUR_API_KEY]&s=[SEARCH_TERM]&type=movie` (for search) and `http://www.omdbapi.com/?apikey=[YOUR_API_KEY]&i=[IMDB_ID]&plot=full` (for details).
- **Parameters**:
  - `s`: Search term (e.g., genre or keyword mapped to mood, or general search query).
  - `i`: IMDb ID for specific movie details.
  - `type`: Set to `movie` to filter out non-movie results.
  - `apikey`: Securely stored API key.
- **Response Handling**: Parses JSON response to extract relevant fields.
- **Rate Limiting**: Adheres to OMDB API’s free tier limit (1,000 requests/day), with fallback messaging for exceeded limits.

## 4. Mood-to-Genre Mapping
- Stored in `config.json` for dynamic updates.
- Mappings have been refined to improve accuracy with OMDB's search capabilities, including more specific genres and keywords for each mood.

## 5. Development Workflow

### 5.1 Git Workflow
- **Repository**: Initialize a Git repository on GitHub.
- **Branching**: Use `main` for production-ready code and `dev` for development. Create feature branches (e.g., `feature/mood-selector`) for new functionality.
- **Commits**: Follow conventional commits (e.g., `feat: add mood selection UI`, `fix: handle API errors`).
- **CI/CD**: Configure a CI/CD pipeline (e.g., GitHub Actions or Netlify) to automatically build and deploy on push to `main`.

### 5.2 Deployment
- **Hosting**: Deploy to a static hosting service supporting continuous deployment from Git (e.g., Netlify, Vercel, or GitHub Pages).
- **Build Process**: Bundle assets, ensuring API keys are injected securely during build.
- **Domain**: Optional custom domain setup via hosting platform.

## 6. User Flow
1. User lands on the homepage and sees a mood selection interface.
2. User selects a mood (e.g., Happy).
3. Application maps the mood to a genre (e.g., Comedy) and makes an OMDB API call.
4. Application displays a list of 5-10 movie recommendations with posters and details.
5. User can view past searches stored in local storage or select a new mood.
6. Error messages are shown for failed API calls or invalid selections.

## 7. Constraints
- **No Local Server**: All logic must be client-side to avoid server-side dependencies.
- **API Limitations**: Must work within OMDB API’s free tier constraints.
- **Browser Compatibility**: Support modern browsers (Chrome, Firefox, Safari, Edge) with fallback for older versions.
- **Storage**: Use browser’s local storage instead of a database to store search history.

## 8. Deliverables
- **Source Code**: Fully functional codebase hosted on GitHub.
- **Documentation**: README.md with setup, deployment, and usage instructions.
- **Deployed Application**: Live URL hosted on a static hosting platform.
- **API Key Management**: Instructions for securely adding the OMDB API key during deployment.

## 9. Future Enhancements
- **Enhance "Load More" Functionality for General Search**: Allow loading more results for general movie searches.
- **More Granular Error Handling and User Feedback**: Differentiate between API errors and provide visual loading indicators.
- **Code Modularization**: Break down `script.js` into smaller, more manageable modules.
- **Accessibility Improvements**: Ensure WCAG compliance for better user experience.
- **Favorites Page**: Create a dedicated page to view and manage favorite movies.

## 10. Assumptions
- Users have a valid OMDB API key (free tier available).
- Users are familiar with basic Git operations for cloning and deploying the repository.
- The application will be used on devices with stable internet access for API calls.

## Current Progress (2025-07-23)
- **TMDB API Removal**: All TMDB API usage has been removed, and mood-based recommendations now solely rely on OMDB.
- **Enhanced Movie Details Page**: Implemented a two-column layout with comprehensive movie information, share functionality, and add-to-favorites.
- **Improved Mood Mapping Accuracy**: Refined genre and keyword associations in `config.json`.
- **Separate Search Bar**: Added a new UI element and functionality for a general movie search.
- **Improved Mobile View Alignment**: Addressed mobile view alignment issues for better responsiveness.
- **API Key Handling Fix**: Resolved the API key issue on the movie details page by ensuring `window.OMDB_API_KEY` is correctly set.
- **Loading Indicators & Error Messages**: Added visual loading indicators and clearer error messages for improved user feedback.
