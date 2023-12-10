const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  features: [{ logoUrl: String }], // List of features included in the plan
  price: { type: Number, required: true },
  duration: { type: String, required: true }, // Duration in months
  // Additional plan details
  // ...
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
module.exports = SubscriptionPlan;