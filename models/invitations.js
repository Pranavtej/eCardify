const mongoose = require('mongoose');

const invitationPageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  headerMsg: {
    text: { type: String, default: '' },
    style: { type: String, default: '' },
  },
  headerSlider: [
    {
      image: { type: String, default: '' },
      text: { type: String, default: '' },
      style: { type: String, default: '' },
    },
  ],
  button: {
    text: { type: String, default: '' },
    style: { type: String, default: '' },
    redirect: { type: String, default: '' },
  },
  customMsgHead: {
    text: { type: String, default: '' },
    style: { type: String, default: '' },
  },
  customMsg: {
    text: { type: String, default: '' },
    style: { type: String, default: '' },
  },
  sliderImg: [
    {
      image: { type: String, default: '' },
      text: { type: String, default: '' },
      style: { type: String, default: '' },
    },
  ],
  maps: {
    longitude: { type: String, default: 0 },
    latitude: { type: String, default: 0 },
  },
  contactInfo: [
    {
      field: { type: String, default: '' },
      value: { type: String, default: '' },
      style: { type: String, default: '' },
    },
  ],
  extraImg: [
    {
      img: { type: String, default: '' },
    },
  ],
  about:{
    text: { type: String, default: '' },
    style: { type: String, default: '' },
  },
});

const InvitationPage = mongoose.model('InvitationPage', invitationPageSchema);

module.exports = InvitationPage;
