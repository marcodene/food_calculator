const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLenght: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    age: {
      type: Number,
      min: 0,
    },
    nationality: {
      type: String,
    },
    friends: [
      {
        username: { type: String },
        friendId: { type: mongoose.ObjectId },
      },
    ],
    waterPrint: { type: Number, default: 0 },
    foodsEaten: [
      {
        foodId: { type: mongoose.ObjectId },
        timesEaten: { type: Number },
      },
    ],
    history: [
      {
        date: { type: Date },
        foods: [
          {
            foodId: { type: mongoose.ObjectId },
            portions: { type: Number, default: 1 },
          },
        ],
      },
    ],
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// finding a user with same email and comparing the passwords
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new Error("Email or password are wrong");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email or password are wrong");
  }

  return user;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id.toString(),
    },
    process.env.JWT_SECRET
  );

  user.tokens = user.tokens.concat({
    token,
  });

  await user.save();

  return token;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
