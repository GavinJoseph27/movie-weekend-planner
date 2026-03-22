const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.static(__dirname)); // Serve static files

// PUG setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'pages'));


// Order history for statistics
let orderHistory = [];
let streamingServices = [];

// Stats calculation
function computeStats() {
  return streamingServices.map(service => {
      // Filter orders that contain this service
      const serviceOrders = orderHistory.filter(o => o.movies[service.name]);

      // Flatten all movies ordered from this service
      const allMovies = serviceOrders.flatMap(o => o.movies[service.name] || []);
      const totalMovies = allMovies.length;

      // Total revenue including service fees
      const totalRevenue = serviceOrders.reduce((sum, o) => {
          const movieTotal = (o.movies[service.name] || []).reduce((s, m) => s + m.price, 0);
          return sum + movieTotal + (o.fees[service.name] || 0);
      }, 0);

      const totalOrders = serviceOrders.length;
      const avgCost = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

      // Most frequently ordered movie
      const movieCount = {};
      allMovies.forEach(m => {
          movieCount[m.title] = (movieCount[m.title] || 0) + 1;
      });

      // Get all movie titles still existing in this service
      const existingTitles = Object.values(service.genres).flatMap(g => g.map(m => m.title));

      // Find top movie that still exists
      const topMovie = Object.keys(movieCount)
          .filter(title => existingTitles.includes(title))
          .sort((a, b) => movieCount[b] - movieCount[a])[0] || 'N/A';

      return {
          name: service.name,
          totalMovies,
          totalRevenue: totalRevenue.toFixed(2),
          avgCost: avgCost.toFixed(2),
          topMovie
      };
  });
}

// Home page
app.get('/', (req, res) => {
  res.render('home');
});

// Order form
app.get('/order', (req, res) => {
  const basicServices = streamingServices.map(s => ({
      id: s.id,
      name: s.name,
      minOrder: s.minOrder,
      serviceFee: s.serviceFee
  }));
  res.render('orderForm', { services: basicServices });
});

// Stats page, rendered by server with stats data
app.get('/stats', (req, res) => {
  const stats = computeStats();
  res.render('statistics', { stats });
});

// Submit order, save order and render stats page
app.post('/submit-order', (req, res) => {
  const order = req.body;
  if (!order) {
      return res.status(400).send('Invalid order data');
  }
  orderHistory.push(order);
  const stats = computeStats();
  res.render('statistics', { stats });
});

// GET /services
app.get('/services', (req, res) => {
  // JSON or HTML depending on Accept header
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
          count: streamingServices.length,
          services: streamingServices.map(s => ({ id: s.id, name: s.name }))
      });
  }
  res.render('services', { services: streamingServices });
});

// POST /services, add a new streaming service
app.post('/services', (req, res) => {

  const { name } = req.body;
  if (!name || !name.trim()) {
      return res.status(400).send('Service name must not be blank');
  }

  // Generate a new unique ID
  const newId = streamingServices.length > 0
      ? Math.max(...streamingServices.map(s => s.id)) + 1
      : 1;

  const newService = {
      id: newId,
      name: name.trim(),
      minOrder: 0,
      serviceFee: 0,
      genres: {}
  };

  streamingServices.push(newService);
  res.status(201).json({ success: true, service: newService });
});

// DELETE /services/:sID, remove a streaming service
app.delete('/services/:sID', (req, res) => {
  const sID = parseInt(req.params.sID);
  const index = streamingServices.findIndex(s => s.id === sID);

  if (index === -1) {
      return res.status(404).send('Service not found');
  }

  const serviceName = streamingServices[index].name;
  streamingServices.splice(index, 1);

  // Remove this service from order history
  orderHistory.forEach(order => {
      delete order.movies[serviceName];
      delete order.fees[serviceName];
  });

  res.json({ success: true });
});

// GET /services/:sID
app.get('/services/:sID', (req, res) => {
  const sID = parseInt(req.params.sID);
  const service = streamingServices.find(s => s.id === sID);

  if (!service) {
      return res.status(404).send('Service not found');
  }

  // Return JSON if requested, otherwise render HTML page
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json(service);
  }

  res.render('serviceInfo', { service });
});

// PUT /services/:sID, update name, serviceFee, minOrder
app.put('/services/:sID', (req, res) => {
  const sID = parseInt(req.params.sID);
  const service = streamingServices.find(s => s.id === sID);

  if (!service) {
      return res.status(404).send('Service not found');
  }

  const { name, serviceFee, minOrder } = req.body;

  // Ensure all required fields are present
  if (!name || serviceFee === undefined || minOrder === undefined) {
      return res.status(400).send('Missing required fields');
  }

  // Update service fields
  service.name = name.trim();
  service.serviceFee = parseFloat(serviceFee);
  service.minOrder = parseFloat(minOrder);

  res.json({ success: true });
});

// POST /services/:sID/genres, add a genre to a service
app.post('/services/:sID/genres', (req, res) => {
  const sID = parseInt(req.params.sID);
  const service = streamingServices.find(s => s.id === sID);

  if (!service) {
      return res.status(404).send('Service not found');
  }

  const { genre } = req.body;

  // Reject blank genre names
  if (!genre || !genre.trim()) {
      return res.status(400).send('Genre name must not be blank');
  }

  // Reject duplicate genres
  if (service.genres[genre.trim()]) {
      return res.status(400).send('Genre already exists');
  }

  // Add genre with empty movies array
  service.genres[genre.trim()] = [];
  res.status(201).json({ success: true });
});

// POST /services/:sID/movies, add a movie to a service
app.post('/services/:sID/movies', (req, res) => {
  const sID = parseInt(req.params.sID);
  const service = streamingServices.find(s => s.id === sID);

  if (!service) {
      return res.status(404).send('Service not found');
  }

  const { genre, movie } = req.body;

  // Ensure genre and movie data are present
  if (!genre || !movie) {
      return res.status(400).send('Missing genre or movie data');
  }

  // Ensure the genre exists in this service
  if (!service.genres[genre]) {
      return res.status(400).send('Genre does not exist in this service');
  }

  // Generate unique movie ID across ALL services
  const allMovies = streamingServices.flatMap(s =>
      Object.values(s.genres).flatMap(g => g)
  );
  const newMovieId = allMovies.length > 0
      ? Math.max(...allMovies.map(m => m.id)) + 1
      : 1;

  // Build and add the new movie
  const newMovie = {
      id: newMovieId,
      title: movie.title.trim(),
      description: movie.description.trim(),
      year: parseInt(movie.year),
      price: parseFloat(movie.price)
  };

  service.genres[genre].push(newMovie);
  res.status(201).json({ success: true, movie: newMovie });
});

// DELETE /services/:sID/movies/:mID, remove a movie from a service
app.delete('/services/:sID/movies/:mID', (req, res) => {
  const sID = parseInt(req.params.sID);
  const mID = parseInt(req.params.mID);

  const service = streamingServices.find(s => s.id === sID);
  if (!service) {
      return res.status(404).send('Service not found');
  }

  // Search all genres for the movie and remove it
  let movieFound = false;
  for (const genre of Object.keys(service.genres)) {
      const index = service.genres[genre].findIndex(m => m.id === mID);
      if (index !== -1) {
          service.genres[genre].splice(index, 1);
          movieFound = true;
          break;
      }
  }

  if (!movieFound) {
      return res.status(404).send('Movie not found');
  }

  res.json({ success: true });
});

// Load all JSON service files then start the server
const servicesDir = path.join(__dirname, 'streamingServices');

fs.readdir(servicesDir, (err, files) => {
  if (err) throw err;

  // Keep only .json files
  files = files.filter(f => path.extname(f) === '.json');

  // Start server immediately if no service files found
  if (files.length === 0) {
      app.listen(3000, () => console.log('Server running on http://localhost:3000'));
      return;
  }

  let remaining = files.length;

  // Read and parse each service file
  files.forEach(file => {
      fs.readFile(path.join(servicesDir, file), (err, data) => {
          if (err) throw err;
          try {
              streamingServices.push(JSON.parse(data.toString()));
          } catch (e) {
              console.log('Invalid JSON in file:', file);
              process.exit(1);
          }

          // Start server once all files are loaded
          if (--remaining === 0) {
              app.listen(3000, () => console.log('Server running on http://localhost:3000'));
          }
      });
  });
});

