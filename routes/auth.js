const express = require("express");
const UsersModel = require("../database/models/User");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require("../middlewares/fetchUser");

const router = express.Router();

router.post(
  "/create-user",
  [
    body("name", "Name must be atleast 3 characters")
      .isLength({ min: 3 })
      .escape(),
    body("email", "Invalid email").isEmail().escape(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 400, statusText: errors.errors[0].msg });
    }

    const data = matchedData(req);
    UsersModel.findOne({ email: data.email }).then((user) => {
      if (user) {
        return res
          .status(400)
          .json({ status: 400, statusText: "User already exists" });
      } else {
        const salt = bcrypt.genSaltSync(10);
        const secPassword = bcrypt.hashSync(data.password, salt);

        UsersModel.create({
          name: data.name,
          email: data.email,
          password: secPassword,
        })
          .then((user) => {
            const data = {
              user: {
                id: user._id,
              },
            };

            const authToken = jwt.sign(data, process.env.SECRET_KEY);

            res.json({
              status: 200,
              statusText: "SUCCESS",
              authToken,
            });
          })
          .catch(() => {
            res
              .status(500)
              .json({ status: 500, statusText: "Something went wrong" });
          });
      }
    });
  }
);

router.post(
  "/login",
  [
    body("email", "Invalid email").isEmail(),
    body("password", "Invalid password").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 400, statusText: errors.errors[0].msg });
    }

    const data = matchedData(req);
    UsersModel.findOne({ email: data.email })
      .then((user) => {
        if (!user) {
          return res
            .status(400)
            .json({
              status: 400,
              statusText: "Email or Password is incorrect",
            });
        }

        const isIdentical = bcrypt.compareSync(data.password, user.password);
        if (!isIdentical) {
          return res
            .status(400)
            .json({
              status: 400,
              statusText: "Email or Password is incorrect",
            });
        }

        const payload = {
          user: {
            id: user._id,
          },
        };

        const authToken = jwt.sign(payload, process.env.SECRET_KEY);
        res.json({ status: 200, statusText: "SUCCESS", authToken });
      })
      .catch((error) => {
        console.log(error);
        res
          .status(500)
          .json({ status: 500, statusText: "Something went wrong" });
      });
  }
);

router.post("/get-user", fetchUser, (req, res) => {
    UsersModel.findById(req.user.id).select("-password")
    .then((user) => {
      res.json({ status: 200, statusText: user })
    })
})

router.use((req, res) => {
  res
    .status(400)
    .json({ status: 400, statusText: `cannot ${req.method} ${req.url}` });
});

module.exports = router;
