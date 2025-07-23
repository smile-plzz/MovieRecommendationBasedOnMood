# Movie Recommendation Based on Mood - Project Specification

## 1. Project Overview
The Movie Recommendation Based on Mood application is a web-based platform that suggests movies to users based on their current emotional state. The application will leverage the OMDB API to fetch movie data and will be designed for live deployment using Git for version control, ensuring no reliance on local servers.

## 2. Functional Requirements

### 2.1 User Interface
- **Mood Selection**: Users can select their current mood from a predefined list (e.g., Happy, Sad, Excited, Relaxed) via a dropdown or button interface.
- **Movie Recommendations**: Display a list of movie recommendations with title, poster, year, genre, and a brief plot summary.
- **Search History**: Store user’s recent mood-based searches in the browser’s local storage (no server-side storage).
- **Responsive Design**: The application must be fully responsive for desktop and mobile devices.

### 2.2 Core Features
- **Mood-Based Filtering**: Map moods to specific movie genres or tags (e.g., Happy → Comedy, Sad → Drama).
- **OMDB API Integration**: Fetch movie data using the OMDB API based on mood-genre mappings.
- **Randomized Suggestions**: Provide a randomized selection of movies within the chosen genre to enhance variety.
- **Error Handling**: Display user-friendly error messages for API failures or invalid inputs.

### 2.3 Non-Functional Requirements
- **Deployment**: The application must be deployable to a static hosting service (e.g., GitHub Pages, Netlify, or Vercel) using Git for version control.
- **No Local Server**: All functionality must be client-side, using browser-based technologies.
- **Performance**: API calls should be optimized to minimize latency, with results displayed within 2 seconds under normal network conditions.
- **Security**: Securely handle API keys using environment variables or build-time injection (e.g., `.env` file for deployment).

## 3. API Integration
- **Endpoint**: `http://www.omdbapi.com/?apikey=[YOUR_API_KEY]&s=[SEARCH_TERM]&type=movie`
- **Parameters**:
  - `s`: Search term (e.g., genre or keyword mapped to mood).
  - `type`: Set to `movie` to filter out non-movie results.
  - `apikey`: Securely stored API key.
- **Response Handling**: Parse JSON response to extract relevant fields (Title, Year, Poster, Plot, Genre).
- **Rate Limiting**: Adhere to OMDB API’s free tier limit (1,000 requests/day), with fallback messaging for exceeded limits.

## 4. Mood-to-Genre Mapping
- Example mappings:
  - Happy: Comedy, Adventure
  - Sad: Drama, Romance
  - Excited: Action, Thriller
  - Relaxed: Family, Animation
- Allow for dynamic updates to mappings via a configuration file (e.g., JSON) hosted with the static assets.

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
- Integrate additional APIs (e.g., TMDb) for more detailed movie data.
- Implement a caching mechanism (e.g., Service Workers) to improve performance.
- Add advanced mood detection via user input (e.g., text analysis).

## 10. Assumptions
- Users have a valid OMDB API key (free tier available).
- Users are familiar with basic Git operations for cloning and deploying the repository.
- The application will be used on devices with stable internet access for API calls.

## Current Progress (2025-07-23)
- **Syntax Error Resolution**: Addressed `Uncaught SyntaxError: await is only valid in async functions and the top level bodies of modules` in `script.js` by correctly marking the relevant function as `async`.
- **Codebase Cleanup**: Initiated a significant cleanup of `script.js` to remove extensive code duplication, aiming to improve code readability, maintainability, and overall application stability. This is an ongoing task to resolve issues with movie display.