const express = require("express");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UsersModel = require("../database/models/User");
const fetchUser = require("../middlewares/fetchUser");
const dotenv = require('dotenv')
const axios = require("axios")
dotenv.config()

const router = express.Router();

router.post(
  "/signup",
  [
    body("name", "Name must be atleast 3 characters")
      .isLength({ min: 3 }),
    body("email", "Invalid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
    body("g_token", "Invalid CAPTCHA")
      .isLength({ min: 3 })
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 400, statusText: errors.errors[0].msg });
    }

    axios
      .post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.reCAPTCHA_SECRET_KEY}&response=${req.body.g_token}`)
      .then((response) => {
        if(response.data.success)
        {
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
        else
        {
          res.status(400).json({ status: 400, statusText: "Invalid CAPTCHA" })
        }
      })
      .catch((axiosError) => {
        res.status(500).json({ status: 500, statusText: "Internal Server Error" })
      })
  }
);

router.post(
  "/login",
  [
    body("email", "Invalid email").isEmail(),
    body("password", "Invalid password").exists(),
    body("g_token", "Invalid CAPTCHA").isLength({ min: 3 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 400, statusText: errors.errors[0].msg });
    }

    axios
      .post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.reCAPTCHA_SECRET_KEY}&response=${req.body.g_token}`)
      .then((response) => {
        if(response.data.success)
        {
          const data = matchedData(req);
          UsersModel.findOne({ email: data.email })
            .then((user) => {
              if (!user) {
                return res.status(400).json({
                  status: 400,
                  statusText: "Email or Password is incorrect",
                });
              }

              const isIdentical = bcrypt.compareSync(data.password, user.password);
              if (!isIdentical) {
                return res.status(400).json({
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
        else
        {
          res.status(400).json({ status: 400, statusText: "Invalid CAPTCHA" })
        }
      })
      .catch(() => {
        res.status(500).json({ status: 500, statusText: "Internal Server Error" })
      })
  }
);

router.post("/get-user", fetchUser, (req, res) => {
  UsersModel.findById(req.user.id)
    .select("-password")
    .then((user) => {
      res.json({ status: 200, statusText: user });
    });
});

router.post("/verify-token", (req, res) => {
  const authToken = req.header("Auth-Token")

  if(!authToken)
  {
    return res.json({ status: 200, statusText: "Invalid Token" });
  }

  try {
    const data = jwt.verify(authToken, process.env.SECRET_KEY)

    if(data)
    {
      res.json({ status: 200, statusText: "Valid Token" });
    }
  } catch (error) {
    console.log(error)
    res.json({ status: 200, statusText: "Invalid Token" });
  }
})

router.use((req, res) => {
  res
    .status(404)
    .json({ status: 404, statusText: `Cannot ${req.method} ${req.url}` });
});

module.exports = router;
