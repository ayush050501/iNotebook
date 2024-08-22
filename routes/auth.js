const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var dotenv = require('dotenv').config();
const fetchuser = require('../middleware/fetchuser');

const router = express.Router();

const JWT_SECRET = process.env.SECRET;

// ROUTE 1 : end point to create a user - sign up
router.post('/createuser',[
    body('email').isEmail(),
    body('password').isLength({min:5})
    ],async (req,res)=>{
  let success = false;
  const result = validationResult(req);
    if (!result.isEmpty()) {
    return res.status(400).send({success,errors: result.array() });
    }
  try{
    let user = await User.findOne({email:req.body.email});
  if(user){
    return res.status(400).json({success,error: "sorry, user with this email already exists"});
  }
  // making secured password using bcryptjs of node.js
  const salt = await bcrypt.genSalt(10);

  const secPass = await bcrypt.hash(req.body.password,salt);
  user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: secPass
  })

  const data = {
    user:{
      id:user.id
    }
  }
  
  const authToken = jwt.sign(data,JWT_SECRET);
  console.log(authToken);
  success=true;
  // res.json(user)

  res.json({success,authToken});

  } catch(error){
    console.error(error.message);
    res.status(500).send("Some error occured");
  }
  
  
})

// ROUTE 2 : end point to authentication of user-login
router.post('/login',[
  body('email').isEmail()
  ],async (req,res)=>{
    let success = false;
  // error if email is invalid
  const result = validationResult(req); // return an array of errors stored in result
  if (!result.isEmpty()) {
  return res.status(400).send({success, errors: result.array() });
  }
  //destructuring of user
  const {email,password} = req.body;
  try {
    // finding email in database
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({success,error: "Please login with correct Credentials"});
    }

    //comparison of password 
    const passwordCompare = await bcrypt.compare(password,user.password);
    if(!passwordCompare){
      return res.status(400).json({success,error: "Please login with correct Credentials"});
    }
    
    const data = {
      user:{
        id:user.id
      }
    }
    
    const authToken = jwt.sign(data,JWT_SECRET);
    success=true;
    res.json({success,authToken});

  } catch(error){
    console.error(error.message);
    res.status(500).send("Some error occured");
  }
  })
  

  // ROUTER 3 : get logged in user details
  router.post('/getuser',fetchuser,async (req,res)=>{
  try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password"); 
      res.send(user);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured"); 
  }

})


module.exports= router;