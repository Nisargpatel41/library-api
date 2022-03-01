const mongoose = require("mongoose");
const { boolean } = require("joi");

const contactFormSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String },
  userPhone: { type: String, required: true },
  createdAt: {
    type: String,
    required: true,
  },
  isDeleted: { type: Boolean, required: false, default: false },
});

const User = mongoose.model("UserInfo", contactFormSchema);

exports.User = User;
