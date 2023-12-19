const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cardType: { type: mongoose.Schema.Types.ObjectId, ref: 'CardType', required: true },
  img: {
    data: Buffer,
    contentType: String,
  },
  fields: [
    {
      name: String,
      type: String, // Specify the data type (e.g., text, number, email)
    },
  ],
  // Additional template details
  // ...
});

const Template = mongoose.model('Template', templateSchema);
module.exports = Template;
