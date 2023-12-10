const mongoose = require('mongoose');

const cardTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  purpose: { type: String, required: true },
  fields: [
    {
      name: String,
      type: String, // Specify the data type (e.g., text, number, email)
    },
  ],
  templates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Template' }], // Array of templates
  // Additional card type details
  // ...
});

const CardType = mongoose.model('CardType', cardTypeSchema);
module.exports = CardType;

