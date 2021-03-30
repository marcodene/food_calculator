const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  waterPrint: {
    type: Number,
  },
  portion: {
    type: String,
    trim: true,
    lowercase: true,
  },
});

const Food = mongoose.model("food", foodSchema);

module.exports = Food;
