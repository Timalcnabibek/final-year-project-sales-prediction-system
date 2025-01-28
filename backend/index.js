const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const newcus = require("./routes/signup_r.js");



//middlewares
app.use(cors());
app.use(express.json());
dotenv.config();


// post methods
app.use('/api',newcus)


//connection to database
const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });


  
//   running the server
  app.listen(process.env.PORT, () =>{
    console.log("Backend server is running on port", process.env.PORT);
  })
