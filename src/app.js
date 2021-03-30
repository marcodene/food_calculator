const express = require("express");
const path = require("path");
require("./db/mongoose");
const userRouter = require("./router/user");
const foodRouter = require("./router/food");

const app = express();
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));
app.use(express.json());
app.use("/api", userRouter);
app.use("/api", foodRouter);

module.exports = app;
