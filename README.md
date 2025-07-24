# 🎬 Movie Recommendation Based on Mood

A web-based application that recommends movies to users based on their current mood. It uses the [OMDB API](http://www.omdbapi.com/) to fetch movie data and is fully deployable to static hosting platforms like GitHub Pages, Netlify, or Vercel — no backend or local server required.

---

## 🚀 Live Demo

> **Coming Soon** – Add your deployed link here once hosted!

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
- Select moods like **Happy**, **Sad**, **Excited**, or **Relaxed**.
- Moods mapped to appropriate movie genres (e.g., Happy → Comedy, Adventure).

### 🎥 Movie Recommendations
- Title, Poster, Year, Genre, Plot Summary.
- Randomized recommendations for variety.

### 💾 Local Storage
- Stores recent mood-based searches locally (no server/database needed).

### 📱 Responsive Design
- Works on all devices: desktop, tablet, and mobile.

### 🔐 Secure API Integration
- Uses OMDB API with environment-based key injection.
- Optimized error handling for failed requests and exceeded rate limits.

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

Create a `.env` file in the root directory with:

```
VITE_OMDB_API_KEY=your_api_key_here
```

(If not using Vite, update the build system accordingly.)

### 3. Run Locally (Optional if you're modifying via GitHub only)

Use a local server (like Live Server for VS Code) to preview changes.

---

## 🎯 Usage

1. Open the deployed link.
2. Select your mood.
3. View curated movie recommendations.
4. Access past moods via local storage.

---

## 🚀 Deployment

### One-click Deploy (Choose One)

- **GitHub Pages**: Push to `main`, and enable GitHub Pages.
- **Netlify**: Link repo → Set `VITE_OMDB_API_KEY` in environment → Deploy.
- **Vercel**: Same as Netlify; auto-build on push to `main`.

---

## 📁 Folder Structure

```
movie-mood-recommender/
│
├── index.html
├── style.css
├── script.js
├── mood-config.json       # Mood-to-genre mapping (editable)
├── .env                   # API key (not committed)
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

Stored in `mood-config.json` for easy editing. Default mappings:

```json
{
  "Happy": ["Comedy", "Adventure"],
  "Sad": ["Drama", "Romance"],
  "Excited": ["Action", "Thriller"],
  "Relaxed": ["Family", "Animation"]
}
```

---

## 🐞 Known Issues

- **Await Error**: Resolved `Uncaught SyntaxError: await is only valid in async functions...` by properly using `async` in relevant functions.
- **Code Duplication**: Ongoing refactoring in `script.js` to enhance clarity and maintainability.

---

## 🚧 Future Enhancements

- 🌐 Add TMDb API for richer movie metadata.
- ⚙️ Implement caching with Service Workers.
- 🧠 Use AI to detect mood via text input.
- 🛠️ Improve offline support with local fallback data.

---

## 📜 License

MIT License. Feel free to fork and customize!

---

## 📣 Acknowledgments

- [OMDB API](http://www.omdbapi.com/)
- Inspiration from emotion-driven UX design patterns
