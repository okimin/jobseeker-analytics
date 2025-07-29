# Contributors Directory

This directory is for custom profile images that contributors want to use instead of their GitHub avatars.

## How to add your custom image:

1. **Add your image file** to this directory
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
   - Recommended size: 400x400 pixels or larger
   - Keep file size under 2MB

2. **Update your contributor entry** in `frontend/data/contributors.json`:
   ```json
   {
     "name": "Your Name",
     "github": "your-github-username",
     "avatar": "/contributors/your-image.jpg",
     "message": "Your Name was here! 🚀",
     "contribution": "First contribution - Wall of Fame",
     "date": "2025-01-27"
   }
   ```

## Guidelines:

- **Safe for Work**: Only use images that are appropriate for a professional environment
- **Personal**: Use an image that represents you (photo, avatar, logo, etc.)
- **Quality**: Use clear, high-quality images
- **Size**: Keep files reasonably sized for fast loading

## Default Option:

If you don't want to add a custom image, you can use your GitHub avatar by setting:
```json
"avatar": "https://github.com/your-github-username.png"
```

This will automatically use your current GitHub profile picture. 