const express = require("express");
require("./db/mongoose");
const userRouter = require("./router/user");
const foodRouter = require("./router/food");

const app = express();

app.use(express.json());
app.use("/api", userRouter);
app.use("/api", foodRouter);

module.exports = app;
