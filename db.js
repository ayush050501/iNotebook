const mongoose = require('mongoose');
var dotenv = require('dotenv').config();

const mongoURI = process.env.mongo_URI;


const connectToMongo = ()=>{
    mongoose.connect(mongoURI
      );
    // console.log("connected to mongo");
}

module.exports = connectToMongo;