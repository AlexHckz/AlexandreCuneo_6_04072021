const express = require('express');

// security
require('dotenv').config()
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


// const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

const mongoose = require('mongoose');
const path = require('path');
const userRoutes = require('./routes/user.js');
const sauceRoutes = require('./routes/sauce.js');

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


// SECURITY NPM PACKAGES

// HELMET
app.use(helmet());

// MONGO SANITIZE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// To remove data, use:
app.use(mongoSanitize());
// Or, to replace prohibited characters with _, use:
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// RATE LIMITER
app.use(limiter);

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;