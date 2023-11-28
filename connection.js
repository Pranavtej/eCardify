const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load the environment variables from .env file
dotenv.config();

// MongoDB connection URL
const mongoUrl = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// Set up MongoDB connection
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1); // Exit process on connection error
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = mongoose;
