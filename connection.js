const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load the environment variables from .env file
dotenv.config();

// MongoDB connection URL
const mongoUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;

// Set up MongoDB connection
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
