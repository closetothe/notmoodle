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
  child: {type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
                }], required: false},
  user: {type: String, required: true},
  body: {type: String, required: true},
  admin: {type: Boolean, required: true},
  timestamp: {
        type: Date,
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now
      }
});

module.exports = mongoose.model("Post", postSchema);