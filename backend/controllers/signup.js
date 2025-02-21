const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const model = require("../model/cusmod");

// Function to generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Nodemailer setup (Use your email credentials)
const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service provider
    auth: {
        user: "timalsinab39@gmail.com", 
        pass: "fdkv gdno fdzo bgwu"
    }
});

// Function to send OTP via email
const sendOTPEmail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: '"ECommerce" <timalsinab39@gmail.com>',
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
            html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in <strong>5 minutes</strong>.</p>`
        });
        console.log(`OTP sent to ${email}: ${otp}`);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

const createcus = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        // Check if user already exists
        const existingUser = await model.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // ✅ Generate OTP
        const otp = generateOTP();
        const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        // ✅ Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Create user with OTP
        const cus = await model.create({
            username,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpExpiration,
            isVerified: false
        });

        // ✅ Log OTP and expiration in the createcus function
        console.log("Saved OTP:", cus.otp);
        console.log("Saved OTP Expiration:", cus.otpExpiration);

        // ✅ Send OTP to user's email
        await sendOTPEmail(email, otp);


        res.status(201).json({ message: "User registered. OTP sent to email.", userId: cus._id });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};


module.exports = createcus;
