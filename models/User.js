var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");


// User

var userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: String,
  admin: Boolean,
  dateCreated: {
        type: Date,
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now
      }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

