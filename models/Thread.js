var mongoose = require("mongoose");


// Post

var threadSchema = new mongoose.Schema({
  title: String,
  initializer: {type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
                }], required: true}
});

module.exports = mongoose.model("Thread", threadSchema);