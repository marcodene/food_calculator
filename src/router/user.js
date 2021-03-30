const express = require("express");
const axios = require("axios");
const User = require("../models/user");
const auth = require("../middleware/auth");
const showUser = require("../utilis/showUser");
const router = new express.Router();

// Create a new user
router.post("/register", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Logging in your account
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

// Reading my profile
router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

// Deleting my account
router.delete("/me", auth, async (req, res) => {
  try {
    const user = await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// Update my account
router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "email", "age", "nationality"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.send(400).send(e);
  }
});

// Add friends
router.post("/me/friend/:id", auth, async (req, res) => {
  try {
    const friend = await User.findById(req.params.id);

    if (!friend) {
      return res.status(404).send();
    }

    const isAlreadyFriend = req.user.friends.some(
      (friend) => friend._id == req.params.id
    );

    if (isAlreadyFriend) {
      return res.status(400).send({ error: "the user is already your friend" });
    }

    req.user.friends = req.user.friends.concat({
      _id: req.params.id,
      username: friend.username,
    });
    await req.user.save();

    const friendObject = showUser(friend, [
      "email",
      "password",
      "age",
      "nationality",
      "friends",
      "foodsEaten",
      "history",
      "tokens",
      "createdAt",
      "updatedAt",
    ]);

    res.send({ friendObject, friends: req.user.friends });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Remove friend
router.delete("/me/friend/:id", auth, async (req, res) => {
  try {
    //controllare che sia nella lista friends
    const isFriend = req.user.friends.some(
      (friend) => friend._id == req.params.id
    );

    if (!isFriend) {
      return res.status(404).send("No friend found with this id");
    }
    //eliminarlo dalla lista
    req.user.friends = req.user.friends.filter((friend) => {
      return friend._id != req.params.id;
    });
    await req.user.save();
    res.send(req.user.friends);
    //salvare

    //res.send
  } catch (e) {
    res.status(400).send(e);
  }
});

// Search for a new user by its username
router.get("/users/:username", auth, async (req, res) => {
  try {
    const regex = new RegExp("^" + req.params.username + "$", "i");
    const userSearched = await User.findOne({ username: regex });

    if (!userSearched) {
      return res.status(404).send();
    }

    const userObject = showUser(userSearched, [
      "email",
      "password",
      "age",
      "nationality",
      "friends",
      "foodsEaten",
      "history",
      "tokens",
      "createdAt",
      "updatedAt",
    ]);

    res.send(userObject);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Add a new meal
router.post("/me/history", auth, async (req, res) => {
  try {
    // Check if the ids provided exist in the food database, otherwise a 404 Error will be throwm
    await axios({
      method: "get",
      url: `http://localhost:3000/api/food`,
      data: req.body,
    });

    // Adding the new meal to user's history
    req.user.history = req.user.history.concat({
      foods: req.body,
      date: Date.now(),
    });

    // Adding each food of the meal to the foodsEaten list in the User account
    for (let foodToAdd of req.body) {
      let hasAlreadyBeenEaten = false;

      // Updating the user's waterPrint value
      const response = await axios.get(
        `http://localhost:3000/api/food/${foodToAdd.foodId}`
      );
      await User.findOneAndUpdate(
        { _id: req.user._id },
        { $inc: { waterPrint: response.data.waterPrint } }
      );

      // Checking if there are any item in foodsEaten list and if not we are sure that the food has never been eaten
      if (req.user.foodsEaten.length != 0) {
        // Checking if the foodId, provided by the user, matches any foodId in foodsEaten list
        hasAlreadyBeenEaten = req.user.foodsEaten.some((food) => {
          return food.foodId == foodToAdd.foodId;
        });
      }

      if (!hasAlreadyBeenEaten) {
        // Pushing the foodId provided by the user and its portion to the foodEaten list
        req.user.foodsEaten.push({
          foodId: foodToAdd.foodId,
          timesEaten: foodToAdd.portions,
        });
      } else {
        // Since the foodId already exists in the foodsEaten list we have to find its position
        const foodIndex = req.user.foodsEaten.findIndex((food) => {
          return food.foodId == foodToAdd.foodId;
        });

        req.user.foodsEaten[foodIndex].timesEaten += foodToAdd.portions;
      }
    }

    await req.user.save();
    res.send({
      history: req.user.history,
      foodsEaten: req.user.foodsEaten,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/user/water-print", auth, async (req, res) => {});

module.exports = router;
