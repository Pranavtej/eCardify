const mongoose = require('mongoose');

const businessCardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  title: String,
  company: String,
  phone: String,
  email: String,
  address: String,
  subscriptionFeatures: [{ logoUrl: String }], // Features tied to the subscription plan
  // Additional customizable fields
});

const BusinessCard = mongoose.model('BusinessCard', businessCardSchema);
module.exports = BusinessCard;