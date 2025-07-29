# 🎬 Movie Recommendation Based on Mood

A web-based application that recommends movies to users based on their current mood. It uses the [OMDB API](http://www.omdbapi.com/) to fetch movie data and is fully deployable to static hosting platforms like GitHub Pages, Netlify, or Vercel — no backend or local server required.

---

## 🚀 Live Demo

> https://smile-plzz.github.io/MovieRecommendationBasedOnMood/)

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Deployment](#deployment)
- [Folder Structure](#folder-structure)
- [Development Workflow](#development-workflow)
- [Mood to Genre Mapping](#mood-to-genre-mapping)
- [Known Issues](#known-issues)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## ✨ Features

### 🎭 Mood-Based UI
- Select moods from a predefined list (e.g., Happy, Sad, Excited, Relaxed).
- Moods are mapped to relevant movie genres and keywords for recommendations.

### 🔍 General Movie Search
- A separate search bar to search for any movie by title.

### 🎥 Movie Recommendations
- Displays movie title, poster, year, genre, and plot summary.
- Randomized recommendations within selected genres to enhance variety.
- Prevents duplicate movie recommendations.

### 🎬 Enhanced Movie Details Page
- Modern and engaging design with improved typography and subtle animations.
- Displays comprehensive movie information including ratings (IMDb, Rotten Tomatoes, Metacritic), Metascore, IMDb Votes, DVD release date, Production company, and Website.
- **Share Functionality**: Easily share movie details links.
- **Add to Favorites/Watchlist**: Save movies to a local storage-based favorites list.

### 💾 Local Storage
- Stores recent mood-based searches and favorite movies locally (no server/database needed).

### 📱 Responsive Design
- Works seamlessly on desktop, tablet, and mobile devices with optimized alignment.

### 🔐 Secure API Integration
- Uses OMDB API with environment-based key injection.
- Optimized error handling for failed requests and exceeded rate limits.

### 🎨 UI/UX Enhancements
- Refined dark theme for a more immersive experience.
- Improved typography and layout for better readability and visual hierarchy.
- Enhanced interactive elements (buttons, input fields) with subtle transitions and shadows.
- Redesigned movie cards for a cleaner, more engaging presentation.
- Optimized responsiveness across various devices, ensuring consistent alignment and usability.

---

## 🧰 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **API**: [OMDB API](http://www.omdbapi.com/)
- **Version Control**: Git & GitHub
- **Deployment**: GitHub Pages / Netlify / Vercel

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/movie-mood-recommender.git
cd movie-mood-recommender
```

### 2. Add Your OMDB API Key

Your OMDB API key should be set directly in `index.html` and `movie-details.html` within the `<script>` tag that defines `window.OMDB_API_KEY`.

Example in `index.html`:

```html
<script>
    window.OMDB_API_KEY = 'YOUR_API_KEY_HERE';
</script>
```

### 3. Run Locally

Use a local server (like Live Server for VS Code or Python's `http.server`) to preview changes. For example:

```bash
python3 -m http.server 8000
```

Then open your browser to `http://localhost:8000`.

---

## 🎯 Usage

1. Open the deployed link or run locally.
2. Select your mood to get recommendations, or use the general search bar.
3. Click on a movie to view its detailed information.
4. On the movie details page, you can share the link or add the movie to your favorites.
5. Access past mood searches via local storage.

---

## 🚀 Deployment

### One-click Deploy (Choose One)

- **GitHub Pages**: Push to `main`, and enable GitHub Pages.
- **Netlify**: Link repo → Set environment variables (if applicable) → Deploy.
- **Vercel**: Same as Netlify; auto-build on push to `main`.

---

## 📁 Folder Structure

```
movie-mood-recommender/
│
├── index.html
├── style.css
├── script.js
├── movie-details.html
├── service-worker.js
├── config.json       # Mood-to-genre mapping (editable)
└── README.md
```

---

## 🔄 Development Workflow

### Git Strategy

- `main`: Production-ready code
- `dev`: Development integration
- `feature/*`: New features (e.g., `feature/mood-selector`)

### Commit Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add mood selector
fix: handle API error gracefully
chore: cleanup duplicate code
```

### CI/CD

- GitHub Actions / Netlify CI for auto-deployment on push to `main`.

---

## 🎨 Mood to Genre Mapping

Stored in `config.json` for easy editing. The mappings have been refined to improve accuracy with OMDB's search capabilities.

---

## 🐞 Known Issues

- CSS `replace` tool can be finicky due to strict matching (whitespace, line endings). Granular changes are recommended.

---

## 🚧 Future Enhancements

- **Enhance "Load More" Functionality for General Search**: Allow loading more results for general movie searches.
- **More Granular Error Handling and User Feedback**: Differentiate between API errors and provide visual loading indicators.
- **Code Modularization**: Break down `script.js` into smaller, more manageable modules.
- **Accessibility Improvements**: Ensure WCAG compliance for better user experience.
- **Favorites Page**: Create a dedicated page to view and manage favorite movies.

---

## 📜 License

MIT License. Feel free to fork and customize!

---

## 📣 Acknowledgments

- [OMDB API](http://www.omdbapi.com/)
- Inspiration from emotion-driven UX design patterns
