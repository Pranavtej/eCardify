const mongoose = require('mongoose');

const businessCardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  Image:String,
  bgImg:String,
  bgColor:String,
});

const BusinessCard = mongoose.model('BusinessCard', businessCardSchema);
module.exports = BusinessCard;
