const express = require("express");
const { body, validationResult, matchedData } = require("express-validator");
const fetchUser = require("../middlewares/fetchUser");
const NotesModel = require("../database/models/Note");
const router = express.Router();

router.post(
  "/add",
  fetchUser,
  [
    body("title", "Note's title must be atleast 3 characters")
      .isLength({ min: 3 })
      .escape(),
    body("description", "Note's description must be atleast 5 characters")
      .isLength({ min: 5 })
      .escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 400, statusText: errors.errors[0].msg });
    }

    const data = {
      ...matchedData(req),
      tag: req.body.tag,
      user: req.user.id,
    };
    NotesModel.create(data)
      .then((note) => {
        res.json({ status: 200, statusText: "SUCCESS" });
      })
      .catch((error) => {
        console.log(error);
        res
          .status(500)
          .json({ status: 500, statusText: "Internal Server Error" });
      });
  }
);

router.put("/update/:id", fetchUser, (req, res) => {
  const { title, description, tag } = req.body;
  const newNote = {};

  if (title.trim()) newNote.title = title;
  if (description.trim()) newNote.description = description;
  if (tag.trim()) newNote.tag = tag;

  NotesModel.findById(req.params.id)
    .then((note) => {
      if (note.user.toString() !== req.user.id) {
        return res
          .status(401)
          .json({ status: 401, statusText: "Unauthorized" });
      }
      NotesModel.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      )
        .then((note) => {
          res.json({ status: 200, statusText: "SUCCESS" });
        })
        .catch((error) => {
          console.log(error);
          res
            .status(500)
            .json({ status: 500, statusText: "Internal Server Error" });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ status: 500, statusText: "Something went wrong" });
    });
});

router.delete("/delete/:id", fetchUser, (req, res) => {
  NotesModel.findById(req.params.id)
    .then((note) => {
      if (note.user.toString() !== req.user.id) {
        return res
          .status(401)
          .json({ status: 401, statusText: "Unauthorized" });
      }

      NotesModel.findByIdAndDelete(req.params.id)
        .then((note) => {
          res.json({ status: 200, statusText: "SUCCESS" });
        })
        .catch((error) => {
          console.log(error);
          res
            .status(500)
            .json({ status: 500, statusText: "Internal Server Error" });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ status: 500, statusText: "Something went wrong" });
    });
});

router.get("/fetch-all", fetchUser, (req, res) => {
  NotesModel.find({ user: req.user.id })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ status: 500, statusText: "Internal Server Error" });
    });
});

router.use((req, res) => {
  res
    .status(404)
    .json({ status: 404, statusText: `Cannot ${req.method} ${req.url}` });
});

module.exports = router;
