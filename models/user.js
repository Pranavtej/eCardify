const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  // password: { type: String, required: true },
  number: { type: Number, required: true },
  selectedItems: [
    {
      occasion: { type: String, default: 'DefaultOccasion' },
      cardType: { type: mongoose.Schema.Types.ObjectId, ref: 'CardType' },
      template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
      subscriptionPlan: {
        plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
        expiresAt: { type: Date },
      },
      businessCard: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessCard' },
    },
  ],
});



const User = mongoose.model('User', userSchema);
module.exports = User;
