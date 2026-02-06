# Baby Growth Chart - Web App

React + Vite web application for visualizing WHO growth percentiles.

## Development

```bash
npm install          # install dependencies
npm run data         # convert WHO Excel files to JSON
npm run dev          # start dev server (localhost:5173)
```

## Production Build

```bash
npm run build        # outputs to dist/
npm run preview      # preview production build locally
```

## Deploy to Vercel

This app is configured for Vercel deployment:

1. Import your GitHub repository on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `web`
3. Deploy

The `vercel.json` file handles SPA routing and the build configuration.

## Excel File Format (for Evolution page)

To upload your baby's data, create an Excel file with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `day` | Age in days | 0, 30, 60... |
| `w` | Weight (kg) | 3.2, 4.5... |
| `h` | Height (cm) | 50, 54... |
| `hc` | Head circumference (cm) | 35, 37... |

You can also click **"Download template"** on the Evolution page to get a pre-filled `.xlsx` file with the correct format and sample data.

## Tech Stack

- React 19
- Vite 7
- Plotly.js for charts
- React Router for navigation
