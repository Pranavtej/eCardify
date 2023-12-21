const mongoose = require('mongoose');

const customizablePageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: String,
  imageSize: String,
  basicInformationFields: [{
    fieldName: String,
    value: String,
    textColor: String,
    textStyle: { type: String, enum: ['normal', 'italic', 'bold'] },
    textSize: Number,
  }],
  contactInfoFields: [{
    fieldName: String,
    value: String,
    textColor: String,
    textStyle: { type: String, enum: ['normal', 'italic', 'bold'] },
    textSize: Number,
    icon: String,
  }],
  additionalButtons: [{
      fieldName: String,
      value: String,
      textStyle: { type: String, enum: ['normal', 'italic', 'bold'] },
      buttonColor: String,
      buttonSize: Number,
    }],
  
  socialMediaFields: [{
    fieldName: String,
    value: String,
    textColor: String,
    textStyle: { type: String, enum: ['normal', 'italic', 'bold'] },
    textSize: Number,
  }],
  views: {
    type: Number,
    default: 0,
  },
  shares: {
    type: Number,
    default: 0,
  },
  saves: {
    type: Number,
    default: 0,
  },
  messages: [String], // Assuming messages are strings without a specific sender
});

const CustomizablePage = mongoose.model('CustomizablePage', customizablePageSchema);

module.exports = CustomizablePage;
