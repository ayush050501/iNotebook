const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");

//ROUTE 1 : get all the notes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured");
  }
});

//ROUTE 2 : ADD the notes
router.post(
  "/addnote",
  fetchuser,
  [
    body("title").isLength({ min: 3 }),
    body("description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const user = req.user.id;
      const result = validationResult(req); // return an array of errors stored in result
      if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user,
      });

      const savednote = await note.save();
      res.json([savednote]);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured");
    }
  }
);

//ROUTE 3 : Update the note
router.put(
  "/updatenote/:id", fetchuser, async (req, res) => {
    try {
        // create a new note object     
      const { title, description, tag } = req.body;
      const newNote = {};
      if(title){
        newNote.title=title;
      }
      if(description){
        newNote.description=description;
      }
      if(tag){
        newNote.tag=tag;
      }

      // Find the note to be updated and update it
      let note = await Note.findById(req.params.id);
      if(!note){
        return res.status(400).send("Not Found");
      }
      if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
      }
      note = await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
      res.json(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured");
    }
  }
);


//ROUTE 4 : Delete the note
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
      try {
        // Find the note to be delete and delete it
        let note = await Note.findById(req.params.id);
        if(!note){
          return res.status(400).send("Not Found");
        }
        // allow only if user owns the note
        if(note.user.toString() !== req.user.id){
          return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Sucess":"Note has been deleted", note:note});
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
      }
    }
  );

module.exports = router;
