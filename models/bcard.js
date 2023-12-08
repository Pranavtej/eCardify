const mongoose = require('mongoose');

const businessCardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  title: String,
  company: String,
  phone: String,
  email: String,
  address: String,
  selectedCardType: { type: mongoose.Schema.Types.ObjectId, ref: 'CardType', required: true },
  selectedTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  selectedSubscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  // Additional customizable fields based on the selected template
  templateFields: [
    {
      fieldName: String,  // Field name from the selected template
      fieldValue: String, // User-entered value for the field
    },
  ],
});

const BusinessCard = mongoose.model('BusinessCard', businessCardSchema);
module.exports = BusinessCard;
