# Movie Recommendation Based on Mood

This is a web-based application that suggests movies to users based on their current emotional state. The application leverages the OMDB API to fetch movie data and is designed for live deployment using Git for version control, ensuring no reliance on local servers.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/movie-recommendation-based-on-mood.git
    ```
2.  **Get an OMDB API Key:**
    - Go to [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx) and get a free API key.
3.  **Add your API Key:**
    - Open the `script.js` file and replace `'YOUR_API_KEY'` with your actual OMDB API key.

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

## Development

This project's development is tracked through the following files:

-   `CONTEXT_LOG.md`: Contains the history of conversations and key decisions.
-   `DEVELOPMENT_LOG.md`: Tracks the technical progress and changes to the codebase.
-   `CONFIG_LOG.md`: Logs changes to the `config.json` file.
