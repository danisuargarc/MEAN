const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const postsRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/", express.static(path.join(__dirname, "angular")));

mongoose
  .connect(
    "mongodb+srv://" + process.env.MONGO_CREDENTIALS + "@mycluster.rvd6b.mongodb.net/MyDatabase?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection to database failed!");
  });

app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);
app.use((request, response, next) => {
  response.sendFile(path.join(__dirname, "angular", "index.html"));
});

module.exports = app;
