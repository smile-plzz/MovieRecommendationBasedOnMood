# Movie Recommendation Based on Mood

This is a web-based application that suggests movies to users based on their current emotional state. The application leverages the OMDB API to fetch movie data and is designed for live deployment using Git for version control, ensuring no reliance on local servers.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/movie-recommendation-based-on-mood.git
    ```
2.  **Get API Keys:**
    -   **OMDB API Key:** Go to [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx) and get a free API key.
    -   **TMDB API Key:** Go to [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) and request a v3 API key.
3.  **Add your API Keys:**
    - Open the `script.js` file and replace the placeholder API keys with your actual OMDB and TMDB API keys.

## Usage

1.  Open the `index.html` file in your browser.
2.  Select your current mood from the buttons provided.
3.  The application will display a list of movie recommendations based on your mood.
4.  Your recent searches will be stored in your browser's local storage and displayed on the page.

## Deployment

This application is designed to be deployed to a static hosting service like GitHub Pages, Netlify, or Vercel.

### GitHub Pages

1.  Push your code to a GitHub repository.
2.  In your repository's settings, go to the "Pages" section.
3.  Select the `main` branch as the source and click "Save".
4.  Your application will be deployed to `https://your-username.github.io/your-repository-name/`.

### Netlify/Vercel

1.  Create a new site from your Git repository.
2.  The build settings should be minimal, as this is a static site.
3.  Your application will be deployed with a live URL.

## API Key Management

For security, it is recommended to use environment variables or build-time injection to handle your API key, especially in a production environment. The hosting services mentioned above provide ways to set environment variables that can be accessed during the build process.



### Recent Updates (2025-07-23)

-   **Mixed Content Fix**: Updated OMDB API calls to ensure HTTPS protocol, resolving mixed content errors.
-   **Codebase Cleanup**: Removed significant code duplication in `script.js` and improved overall code stability and readability.