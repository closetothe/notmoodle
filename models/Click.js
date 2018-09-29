var mongoose = require("mongoose");


// Click

var clickSchema = new mongoose.Schema({
  total: Number,
  what: String,
  operating_systems: [String],
  timestamp: {
        type: Date,
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now
      }
});

module.exports = mongoose.model("Click", clickSchema);