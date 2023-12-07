const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  subscription: {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    expiresAt: { type: Date },
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
