var mongoose = require("mongoose");


// Post

var threadSchema = new mongoose.Schema({
  title: {type: String, required: true},
  responses: Number,
  author: String,
  marked: Boolean,
  timestamp: Date,
  semester: String,
  topic: String,
  initializer: {type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
                }], required: true}
  });

module.exports = mongoose.model("Thread", threadSchema);