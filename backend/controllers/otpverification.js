const model = require("../model/cusmod");

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find user by email
        const user = await model.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Debugging: Log the OTP and expiration values
        console.log("Entered OTP:", otp);
        console.log("Stored OTP:", user.otp);
        console.log("OTP Expiration:", user.otpExpiration);
        console.log("Current Time:", new Date());

        // Check if OTP matches and is not expired
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Ensure otpExpiration is a valid date and compare it with current time
        if (!(user.otpExpiration instanceof Date) || new Date() > user.otpExpiration) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // ✅ Mark user as verified
        user.isVerified = true;
        user.otp = null; // Remove OTP after verification
        user.otpExpiration = null;
        await user.save();

        res.status(200).json({ message: "OTP verified successfully. Account activated!" });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error);
    }
};

module.exports = verifyOTP;
