COMP 2406 A – Assignment 3

Student Name: Gavin Joseph
Student ID: 101348882

Overview:

This assignment builds on Assignment 2 by converting the server to use
Express and the PUG template engine. The server now handles building and
managing streaming service data, including adding, editing, and deleting
services and movies. Pages are now fully server-rendered using PUG templates
instead of static HTML files.

The application allows users to:

- Browse a home page with a welcome message and banner
- Select a streaming service from a server-rendered dropdown
- Browse movies by genre for the selected service
- Add and remove movies from a rental order
- View a dynamic order summary with service fees, tax, and totals
- Submit an order to the server once minimum order requirements are met
- View order statistics per streaming service on a dedicated statistics page
- Add and delete streaming services via the Admin page
- Edit service details, add/remove genres, and add/remove movies via the
  service info page

Files Included:

- server.js: The main Express server file. It loads all streaming service data
  from the streamingServices/ folder on startup, handles all routes, serves
  static files, processes submitted orders, computes statistics, and manages
  adding/editing/deleting services and movies. All pages are rendered here
  using PUG with the necessary data passed in.

- pages/home.pug: The home page served at http://localhost:3000/. Shows a
  welcome message, banner image, and a button to navigate to the order form.

- pages/orderForm.pug: The order form page served at http://localhost:3000/order.
  The list of streaming services is injected by the server on render so no
  client-side fetch is needed on load. Contains the service dropdown, genre
  buttons, movie list, and order summary table.

- pages/statistics.pug: The statistics page served at http://localhost:3000/stats.
  Fully rendered by the server with stats data passed in directly. Shows total
  movies ordered, total revenue, average order cost, and most ordered movie
  for each streaming service.

- pages/services.pug: The Admin page served at http://localhost:3000/services.
  Lists all streaming services currently stored on the server. Allows the user
  to add a new service by name or delete an existing one.

- pages/serviceInfo.pug: The service info page served at
  http://localhost:3000/services/:sID. Allows the user to edit the service
  name, fee and minimum order, add and remove genres, and add and remove
  movies. All movies are displayed grouped by genre in a table at the bottom.

- pages/header.pug: A shared PUG partial included on every page. Contains
  the logo, site title, and navigation links to all pages. The current page's
  nav link is highlighted using a JavaScript active class check on load.

- scripts/Script.js: Handles all client-side logic for the order form page.
  Uses the streamingServices data injected by the server to populate the
  dropdown. Fetches full service data when a service is selected, filters
  movies by genre, handles adding and removing movies from the order,
  calculates subtotal, service fees, tax and total, validates minimum order
  requirements, and submits the order via POST to /submit-order.

- styles/Style.css: The main shared stylesheet used across all pages.
  Contains styling for the header, navigation, buttons, dropdowns, movie
  cards, order summary table, and genre buttons including hover and active
  states.

- styles/home.css: Stylesheet for the home page. Contains styling for the
  banner image and welcome section.

- styles/stats.css: Stylesheet for the statistics page. Contains styling
  for the stats cards and stats table layout.

- streamingServices/: Folder containing JSON files for each streaming service
  (streamIt.json, movieVerse.json, cinemaTime.json). Each file contains the
  service id, name, minOrder, serviceFee, and all genres and movies. New
  services can be added by placing additional .json files in this folder
  without changing any code.

- images/: Folder containing all images used across the site including
  home.jpeg (banner), logo.jpeg (header logo), selected.svg, unselected.svg
  (movie selection icons), and remove.svg (delete icon).

- README.txt: Documentation describing the project structure, design decisions, 
  and usage instructions.


Design Decisions:

- Converted server from raw Node.js http module to Express, using
  express.json() for body parsing and express.static() for static files.
- All HTML pages converted to PUG templates with a shared header.pug
  partial to avoid duplicating the header across pages.
- The /order page injects basic service data (id, name, minOrder, serviceFee)
  directly into the PUG template, eliminating the need for a client-side
  fetch on page load.
- The /stats page is fully server-rendered using computeStats(), eliminating
  the need for the /stats-data route and stats.js from Assignment 2.
- The Accept header is used to determine whether to return JSON or HTML
  for the /services and /services/:sID routes, allowing the same routes
  to serve both the browser and client-side fetch calls.
- Deleting a service also removes it from order history to keep statistics
  accurate.
- The most ordered movie stat filters out deleted movies so the statistics
  page never crashes after a movie is removed.
- New movie IDs are generated by finding the current maximum ID across all
  services and adding 1, ensuring uniqueness across all streaming services.
- New services start with no genres or movies and must be configured via
  the Admin page.

How to Run:

1. Unzip the submission folder.
2. Make sure Node.js is installed on your machine.
3. Open a terminal in the project folder.
4. Run: npm install
5. Run: node server.js
6. Open a browser and go to http://localhost:3000/
