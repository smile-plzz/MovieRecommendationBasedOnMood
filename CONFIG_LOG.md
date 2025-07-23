# Config Log

This log tracks the changes made to the `config.json` file.

## YYYY-MM-DD

*   **Initial Configuration**
    *   Created `config.json` with the initial mood-to-genre mappings:
        ```json
        {
            "moodGenreMapping": {
                "Happy": ["Comedy", "Adventure"],
                "Sad": ["Drama", "Romance"],
                "Excited": ["Action", "Thriller"],
                "Relaxed": ["Family", "Animation"]
            }
        }
        ```
*   **Expanded Moods**
    *   Updated `config.json` with an expanded list of moods and genres:
        ```json
        {
            "moodGenreMapping": {
                "Happy": ["Comedy", "Adventure", "Musical", "Romantic Comedy"],
                "Sad": ["Drama", "Romance", "Tragedy", "Melodrama"],
                "Excited": ["Action", "Thriller", "Sci-Fi", "Fantasy"],
                "Relaxed": ["Family", "Animation", "Documentary", "Slice of Life"],
                "Angry": ["Crime", "Western", "Revenge", "War"],
                "Scared": ["Horror", "Mystery", "Psychological Thriller", "Supernatural"],
                "Inspired": ["Biography", "Historical", "Inspirational", "Sports"],
                "Nostalgic": ["Coming-of-Age", "Period Drama", "Classic", "Retro"],
                "Curious": ["Mystery", "Detective", "Documentary", "Educational"],
                "Romantic": ["Romance", "Romantic Comedy", "Historical Romance", "Chick Flick"],
                "Adventurous": ["Adventure", "Fantasy", "Epic", "Exploration"],
                "Thoughtful": ["Drama", "Philosophical", "Art House", "Indie"]
            }
        }
        ```
