var mongoose = require("mongoose");


// Post

var postSchema = new mongoose.Schema({
  thread: {type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Thread"
                }], required: false},
  parent: {type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
                }], required: false},
  children: {type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
                }], required: false},
  author: {type: String, required: true},
  body: {type: String, required: true},
  admin: {type: Boolean, required: true},
  email: {type: String, required: false},
  depth: Number,
  marked: Boolean,
  timestamp: {
        type: Date,
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now
      }
});

module.exports = mongoose.model("Post", postSchema);