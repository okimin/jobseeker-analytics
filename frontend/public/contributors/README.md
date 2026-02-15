# Contributors Directory

This directory contains profile images for the Wall of Fame. To ensure site security and reliability, all contributor images must be hosted locally in this folder.

## How to add your image

1. **Choose your image**

    - **Option A (GitHub Avatar):** Download your avatar from `https://github.com/your-username.png`
    - **Option B (Custom):** Use any professional, safe-for-work image you like.

2. **Save the file**

    - Save the image into this directory (`frontend/public/contributors/`)
    - Use a unique filename (e.g., `your-github-username.png`)
    - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
    - Recommended size: 400x400 pixels (keep file size under 2MB)

3. **Update `contributors.json`**
    - In `frontend/data/contributors.json`, reference your local file:
    ```json
    {
    	"name": "Your Name",
    	"github": "your-github-username",
    	"avatar": "/contributors/your-filename.png",
    	"message": "Your Name was here! 🚀",
    	"date": "2025-02-15"
    }
    ```

## Guidelines

-   **Safe for Work**: Only use images that are appropriate for a professional environment
-   **No External Links**: Do not use `https://...` URLs in the JSON file; they will be rejected during review.
