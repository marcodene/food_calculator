const express = require("express");
const router = new express.Router();
const Food = require("../models/food");

router.post("/food", async (req, res) => {
  const foodArray = [];
  for (let i in req.body) {
    const food = new Food(req.body[i]);
    await food.save();
    foodArray.push(food);
  }

  try {
    res.status(201).send(req.body);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Check if a list of foods exist
router.get("/food", async (req, res) => {
  try {
    for (let food of req.body) {
      const foodFound = await Food.exists({ _id: food.foodId });

      if (!foodFound) {
        res.status(404).send();
      }
    }
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});

// Getting a food via its id and returning it
router.get("/food/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).send();
    }

    res.send(food);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
