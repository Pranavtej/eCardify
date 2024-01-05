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

// Mongoose middleware to hash simple fields before saving
userSchema.pre('save', async function (next) {
  const user = this;

  // Helper function to hash a field
  const hashField = async (field) => {
    if (user.isModified(field) && (typeof user[field] === 'string' || typeof user[field] === 'number')) {
      try {
        const valueToHash = user[field].toString();
        const hashedValue = await bcrypt.hash(valueToHash, 10);
        user[field] = hashedValue;
      } catch (error) {
        return next(error);
      }
    }
  };

  // Hash simple fields
  const simpleFields = ['username', 'email', 'number'];
  await Promise.all(simpleFields.map(hashField));

  // Hash fields inside the selectedItems array
  if (user.selectedItems && Array.isArray(user.selectedItems)) {
    for (const selectedItem of user.selectedItems) {
      const nestedFields = ['occasion'];
      for (const field of nestedFields) {
        await hashField(`selectedItems.${field}`);
      }
    }
  }

  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
