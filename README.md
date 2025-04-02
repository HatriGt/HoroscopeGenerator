# Horoscope Match Finder

A React application to find perfect horoscope matches based on birth details.

## Features

- Search and select birth locations
- Input birth details (date, time)
- Find perfect horoscope matches
- View match details and compatibility scores
- Download horoscope images
- Search history with filtering
- Ignored dates management

## Tech Stack

- React + TypeScript
- Vite
- React Router
- Tailwind CSS
- Lucide Icons
- Supabase Functions

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials
4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Netlify Deployment Steps

1. Push your code to a GitHub repository

2. In Netlify:
   - Create a new site from Git
   - Connect to your GitHub repository
   - Build settings will be automatically detected from netlify.toml

3. Environment Variables:
   - Add the following environment variables in Netlify's settings:
     - VITE_SUPABASE_URL
     - VITE_SUPABASE_ANON_KEY

4. Deploy!

The site will be automatically built and deployed whenever you push changes to your repository. 