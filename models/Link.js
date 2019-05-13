var mongoose = require("mongoose");

// Link for the nav bar

var linkSchema = new mongoose.Schema({
  title: String,
  href: String
});

module.exports = mongoose.model("Link", linkSchema);