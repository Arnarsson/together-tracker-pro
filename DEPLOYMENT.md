# Deployment Guide for TogetherTracker Pro

## 🚀 Quick Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FArnarsson%2Ftogether-tracker-pro)

### Option 2: Manual Deploy

1. **Fork or Clone the Repository**
   ```bash
   git clone https://github.com/Arnarsson/together-tracker-pro.git
   cd together-tracker-pro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

## 🌐 Deploy to Netlify

### Option 1: Drag & Drop
1. Build the project locally:
   ```bash
   npm install
   npm run build
   ```
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to deploy

### Option 2: Git Integration
1. Push your code to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "New site from Git"
4. Choose your repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click "Deploy site"

## 🐳 Deploy with Docker

1. **Create a Dockerfile**
   ```dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Run**
   ```bash
   docker build -t together-tracker .
   docker run -p 8080:80 together-tracker
   ```

## 🔧 Environment Variables

No environment variables are required for the basic setup as the app uses local storage.

### Future Backend Integration

When you're ready to add a backend (Supabase, Firebase, etc.), create a `.env` file:

```env
# Example for Supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Example for Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 📱 PWA Deployment

The app is PWA-ready. To enable PWA features:

1. **Add a Web App Manifest**
   Create `public/manifest.json`:
   ```json
   {
     "name": "TogetherTracker Pro",
     "short_name": "TogetherTracker",
     "start_url": "/",
     "display": "standalone",
     "theme_color": "#8B5CF6",
     "background_color": "#000000",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

2. **Add Service Worker**
   Use Vite PWA plugin:
   ```bash
   npm install -D vite-plugin-pwa
   ```

## 🔒 Security Considerations

1. **HTTPS Required**: Always deploy to HTTPS-enabled hosts
2. **Content Security Policy**: Add CSP headers for production
3. **Data Privacy**: Currently uses local storage - user data stays on their device

## 📊 Performance Optimization

1. **Enable Compression**: Most hosting providers do this automatically
2. **CDN**: Vercel and Netlify include CDN by default
3. **Caching**: The build process handles cache busting

## 🐛 Troubleshooting

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node version: Should be 18+

### Deployment Issues
- Ensure all files are committed to Git
- Check build logs in your hosting dashboard
- Verify the build command and output directory

## 🆘 Support

For deployment issues:
- Open an issue on [GitHub](https://github.com/Arnarsson/together-tracker-pro/issues)
- Check the [Discussions](https://github.com/Arnarsson/together-tracker-pro/discussions) for community help

---

Happy deploying! 🎉