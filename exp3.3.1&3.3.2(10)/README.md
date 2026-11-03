# Inkly — Blog Publishing Platform

A colorful, responsive React + Vite frontend prototype for a blog publishing website.

## Features
- Discover dashboard with featured story and article cards
- Search stories and filter by category
- Sort by newest or popularity
- Read full articles in a reader view
- Create, edit, publish, and save drafts
- Like, bookmark, and comment on stories
- My Stories, Bookmarks, and Drafts navigation
- Profile menu, demo settings, and dark mode
- Responsive layout for smaller screens
- Browser `localStorage` persistence for demo data

> **Important:** This is a frontend prototype. It does not yet include real user authentication, a shared database, secure role-based admin permissions, or a production backend. The profile and moderation flows are demonstrations.

## Run in Visual Studio Code

1. Install Node.js (LTS): https://nodejs.org/
2. Extract this ZIP file.
3. Open the extracted `blog-publishing-platform` folder in VS Code.
4. Open **Terminal → New Terminal**.
5. Run:

```bash
npm install
npm run dev
```

6. Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Build check

```bash
npm run build
```

## Main files
- `src/main.jsx` — React application and interactions
- `src/styles.css` — colors, layout, responsive styling, and theme
- `index.html` — app entry point
- `package.json` — scripts and dependencies

## Demo data
The app stores demo posts, likes, bookmarks, comments, and profile display name in the current browser's `localStorage`. Data is local to that browser profile and is not shared between users.
