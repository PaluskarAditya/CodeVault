const mongoose = require("mongoose");

const snippetSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  visibility: {
    type: String,
    required: true,
    default: "public",
    enum: ["private", "public"],
  },
  expiry: {
    type: String,
    required: true,
  },
  lang: {
    type: String,
    required: true,
  },
  pass: {
    type: String,
  },
  isProtected: {
    type: Boolean,
    required: true
  }
}, { timestamps: true });

const Snippet =
  mongoose.models.Snippet || mongoose.model("Snippet", snippetSchema);
module.exports = Snippet;
