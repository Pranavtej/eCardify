// logModel.js

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  event: { type: String, required: true },
  details: mongoose.Schema.Types.Mixed,
});

const Log = mongoose.model('Log', logSchema);

class LogModel {
  async logEvent(event, details) {
    const logEntry = new Log({
      event,
      details,
    });

    await logEntry.save();
    console.log('Log entry added to MongoDB:', logEntry);
  }

  async getAllLogs() {
    try {
      const logs = await Log.find().sort({ timestamp: -1 });
      return logs;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LogModel;
