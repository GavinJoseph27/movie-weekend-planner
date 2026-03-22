# Movie Weekend Planner

A full-stack web application that lets users browse movies across multiple streaming services, build a rental order, and view order statistics. Built with Node.js, Express, and the PUG template engine.

## Features

- Browse movies across multiple streaming services filtered by genre
- Build a rental order with real-time price totals, service fees, and tax
- Minimum order validation per streaming service
- Order statistics dashboard showing revenue, average cost, and most ordered movie per service
- Admin panel to add and delete streaming services
- Service management page to edit service details, add/remove genres, and add/remove movies

## Tech Stack

- **Backend:** Node.js, Express
- **Templating:** PUG
- **Frontend:** Vanilla JavaScript, CSS
- **Data:** JSON files for streaming service data

## Getting Started

### Prerequisites
- Node.js installed on your machine

### Installation
1. Clone the repository
```bash
   git clone https://github.com/GavinJoseph27/movie-weekend-planner.git
```
2. Navigate to the project folder
```bash
   cd movie-weekend-planner
```
3. Install dependencies
```bash
   npm install
```
4. Start the server
```bash
   node server.js
```
5. Open your browser and go to `http://localhost:3000`

## Project Structure
```
movie-weekend-planner/
├── server.js               # Express server, all routes and stats logic
├── pages/                  # PUG templates
│   ├── header.pug          # Shared header partial used on every page
│   ├── home.pug            # Home page
│   ├── orderForm.pug       # Movie browsing and order form
│   ├── statistics.pug      # Order statistics dashboard
│   ├── services.pug        # Admin panel for managing services
│   └── serviceInfo.pug     # Edit service details, genres and movies
├── scripts/
│   └── Script.js           # Client-side order form logic
├── styles/
│   ├── Style.css           # Main shared stylesheet
│   ├── home.css            # Home page styles
│   └── stats.css           # Statistics page styles
├── streamingServices/      # JSON data files for each streaming service
└── images/                 # Site images and icons
```

## How It Works

- Streaming service data is loaded from JSON files in the `streamingServices/` folder on server startup. New services can be added by dropping in a new JSON file with no code changes required.
- The order form page has service data injected directly by the server on render, so no client-side fetch is needed on load.
- The statistics page is fully server-rendered, calculating total revenue, average order cost, and most ordered movie per service from the order history.
- The `Accept` header is used to serve either JSON or HTML from the same routes, allowing the browser and client-side fetch calls to share endpoints.

