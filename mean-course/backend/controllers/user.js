const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.createUser = (request, response, next) => {
  bcrypt.hash(request.body.password, 10).then((hash) => {
    const user = new User({
      email: request.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        response.status(201).json({
          message: "User signed up successfully",
          result: result,
        });
      })
      .catch((error) => {
        response.status(500).json({
          message: "Invalid authentication credentials.",
        });
      });
  });
};

exports.loginUser = (request, response, next) => {
  let fetchedUser;

  User.findOne({ email: request.body.email })
    .then((user) => {
      if (!user) {
        return response.status(401).json({
          message: "User authentication failed",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(request.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return response.status(401).json({
          message: "User authentication failed",
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      response.status(200).json({
        token: token,
        expiresIn: 3600,
        message: "User authenticated successfully",
        userId: fetchedUser._id,
      });
    })
    .catch((error) => {
      response.status(401).json({
        message: "Invalid authentication credentials.",
      });
    });
};
