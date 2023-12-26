const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide username"],
    trim: true,
    minlength: [3, "Username characters should be less than 3"],
    maxlength: [20, "Username characters should not be more than 20"],
    unique: true,
  },

  email: {
    type: String,
    required: [true, "Please provide email"],
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: [6, "Password character cannot be less than 6"],
  },
});

module.exports = mongoose.model("Users", UserSchema);
