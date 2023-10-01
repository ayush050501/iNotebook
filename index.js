const connectToMongo = require('./db');
const express = require('express');
var cors = require('cors')
var dotenv = require('dotenv').config();

connectToMongo();

const app = express()
const port = process.env.PORT
 
app.use(cors())
app.use(express.json())

app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))        

app.listen(port, () => {
  console.log(`iNotebook server is listening on port ${port}`)
})