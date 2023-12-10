const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true },
  name: { type: String, required: true },
  features: [{ logoUrl: String }], // List of features included in the plan
  price: { type: Number, required: true },
   // Duration in months
  // Additional plan details
  // ...
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
module.exports = SubscriptionPlan;