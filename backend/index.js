const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const newcus = require("./routes/signup_r.js");
const path = require("path"); // ✅ Import path module
const Login = require('../backend/routes/login_r.js')
const verifyOTP = require('../backend/controllers/otpverification.js')
const ResentOtp = require('../backend/routes/resent.js') 



//middlewares
app.use(cors());
app.use(express.json());
dotenv.config();



//Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

//Route to serve pages
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/signup.html"));
});
app.get("/verify-otp", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/authenticate.html"));
});




// API routes
app.use("/api", newcus);
app.use("/api", Login);
app.use("/api", verifyOTP);
app.use('/api', ResentOtp)



// Database connection
const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));


  
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend server is running on port", PORT);
});
