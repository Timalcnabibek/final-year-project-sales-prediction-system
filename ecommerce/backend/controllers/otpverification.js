const model = require("../model/cusmod");

const verifyOTP = async (req, res) => {
    try {
        let { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        // ✅ Normalize email to match database format
        email = email.trim().toLowerCase();
        console.log("🔍 Received email for OTP verification:", email);

        // ✅ Find user in database
        const user = await model.findOne({ email });

        if (!user) {
            console.log("❌ User not found in database!");
            console.log("🔎 Query executed:", { email });
            console.log("📌 Available Users in Database:");

            const users = await model.find({}, { email: 1, otp: 1 });
            console.log(users); // Log all stored emails and OTPs for debugging

            return res.status(400).json({ message: "User not found. Please sign up again." });
        }

        console.log("✅ User found:", user.email);
        console.log("🔹 Entered OTP:", otp);
        console.log("🔹 Stored OTP:", user.otp);
        console.log("🔹 OTP Expiration:", user.otpExpiration);
        console.log("🔹 Current Time:", new Date());

        // ✅ Ensure OTP is correct
        if (user.otp !== otp) {
            console.log("❌ OTP does not match!");
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // ✅ Ensure OTP is not expired
        if (!user.otpExpiration || new Date() > new Date(user.otpExpiration)) {
            console.log("❌ OTP has expired!");
            return res.status(400).json({ message: "OTP has expired. Request a new one." });
        }

        // ✅ Mark user as verified and clear OTP
        user.isVerified = true;
        user.otp = null;
        user.otpExpiration = null;
        await user.save();

        console.log("✅ OTP verified successfully!");
        res.status(200).json({ message: "OTP verified successfully. Account activated!" });

    } catch (error) {
        console.error("❌ OTP verification error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};

module.exports = verifyOTP;
