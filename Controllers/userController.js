const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Model/userSchema');
const { signupValidation, verifyOtpValidation, resendOtpLinkValidation, resendPasswordLinkValidation,
    resetPasswordLinkValidation, changePasswordValidationLink, loginUserValidation } = require('../Validator/validationSchema')
const { otpMail, welcomeMail, passwordResetLinkMail } = require('../Shared/mailer');
const OtpSchema = require('../Model/otpSchema')


// Generate OTP
const generate2FACode6digits = () => {
    const min = 10000;
    const max = 99999;
    const otp = Math.floor(min + Math.random() * (max - min + 1)).toString();
    return otp;
};

const getUser = asyncHandler(async (req, res) => {
    const user = await User.find()
    res.status(200).json(user)
});

//Route to GET one user
const getOneUser = asyncHandler(async (req, res) => {
    // Find the user in the database based on the provided ID
    const user = await User.findById(req.params.id);

    // Check if the user exists
    if (!user) {
        res.status(404).json({ message: 'Contact not found, check again' });
    }
    res.status(200).json(user);
});

//Register a new user 
const registerUser = asyncHandler(async (req, res) => {
    try {
        // Validate user input
        const { error, value } = await signupValidation(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({ error: error.message });
        }

        const { username, email, password } = req.body;

        // Check if the user already exists
        const userAvailable = await User.findOne({ email: email });
        if (userAvailable) {
            res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = User({
            username,
            email,
            password: hashPassword,
        });

        // Save the user to the database
        await user.save();

        // Generate 2FA code and send OTP email
        const verificationCode = generate2FACode6digits();
        await otpMail(email, verificationCode, username);

        //set expiration time
        const fiveMinuteslater = new Date()
        fiveMinuteslater.setMinutes(fiveMinuteslater.getMinutes() + 2)

        //sav to otp database
        const sentOtp = new OtpSchema()
        sentOtp.email = user.email
        sentOtp.otp = verificationCode
        sentOtp.expirationTime = fiveMinuteslater

        await sentOtp.save()

        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        throw error
    }
});


//Register a new user with link
const registerLinkUser = asyncHandler(async (req, res) => {
    try {
        // Validate user input
        const { error, value } = await signupValidation(req.body, { abortEarly: false });
        if (error) {
            // Return validation error response
            res.status(400).json({ error: error.message });
        }

        const { username, email, password } = req.body;

        // Check if the user already exists
        const userAvailable = await User.findOne({ email: email });
        if (userAvailable) {
            res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            username,
            email,
            password: hashPassword,
        });

        // Save the user to the database
        await user.save();

        const verificationCode = generate2FACode6digits()

        //link verification
        const verificationLink = `http://localhost:5000/api/user/verify-otp?token=${verificationCode}&email=${email}`

        // Generate 2FA code and send OTP email
        await otpMail(email, verificationLink, username);


        //save otp to otp table
        const fiveMinuteslater = new Date()
        await fiveMinuteslater.setMinutes(fiveMinuteslater.getMinutes() + 5)

        const sentOtp = new OtpSchema()
        sentOtp.email = user.email
        sentOtp.otp = verificationCode
        sentOtp.expirationTime = fiveMinuteslater

        await sentOtp.save()

        return res.status(201).json({ message: 'User registered' });
    } catch (error) {
        throw error
    }
});



//user login 
const login = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        const { error, value } = loginUserValidation(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({ message: error.message });
        }

        const { email, password } = req.body;

        // Find a user with the provided email in the database
        const user = await User.findOne({ email });

        // Compare the password provided in the request with the hashed password stored in the user object
        if (user && (await bcrypt.compare(password, user.password))) {
            const accessToken = jwt.sign({
                user: {
                    username: user.username,
                    email: user.email,
                    id: user.id
                }
            },
                process.env.SECRET,
                { expiresIn: '1y' },
            );

            res.status(200).json({ accessToken });
        } else {
            res.status(401).json({ message: 'Login details not correct' });
        }

    } catch (error) {
        throw error
    }
});


const verifyUserOtp = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        const { error, value } = await verifyOtpValidation(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({ error: error.message });
        }

        // Extract data from the request body
        const { otp } = req.body;

        // Check if an OTP record with the provided OTP code exists in the database
        const checkOtp = await OtpSchema.findOne({ otp: otp });
        if (!checkOtp) {
            res.status(404).json({ message: 'Incorrect OTP, please check your email again' });
        }

        // Check if the OTP has expired 
        if (checkOtp.expirationTime <= new Date()) {
            res.status(403).json({ message: 'OTP expired, please request for another one' });
        }

        // Update the 'verified' status of the OTP record to indicate it has been verified
        checkOtp.verified = true;
        await checkOtp.save();

        // Find the user associated with the provided email
        const user = await User.findOne({ email: checkOtp.email });
        if (!user) {
            res.status(404).json({ message: 'User does not exist' });
        }
        user.Isverified = true;
        await user.save()

        // Send a welcome email to the user after OTP verification
        await welcomeMail(user.email, user.username);

        res.status(200).json({ message: 'OTP successfully verified, now proceed to login' });

    } catch (error) {
        throw error;
    }
});



const verifyUserOtpLink = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        // const { error, value } = await verifyOtpValidation(req.body, { abortEarly: false });
        // if (error) {
        //     // If validation fails, return a 400 Bad Request response with a validation error message
        //      res.status(400).json({ error: error.message });
        // }

        // Extract data from the request body
        const { email, token } = req.query;

        // Check if an OTP record with the provided email exists in the database
        const verifyEmail = await OtpSchema.findOne({ email: email });
        if (!verifyEmail) {
            res.status(404).json({ message: 'The email does not match the email the OTP was sent to' });
        }

        // Check if an OTP record with the provided OTP code exists in the database
        const checkOtp = await OtpSchema.findOne({ otp: token });
        if (!checkOtp) {
            res.status(404).json({ message: 'Incorrect OTP, please check your email again' });
        }

        // Check if the OTP has expired (compare with the current time)
        if (checkOtp.expirationTime <= new Date()) {
            res.status(403).json({ message: 'OTP expired, please request for another one' });
        }

        // Update the 'verified' status of the OTP record to indicate it has been verified
        checkOtp.verified = true;
        await checkOtp.save();

        // Find the user associated with the provided email
        const user = await User.findOne({ email: email });
        if (!user) {
            res.status(404).json({ message: 'User does not exist' });
        }
        user.Isverified = true;
        await user.save()

        // Send a welcome email to the user after OTP verification
        await welcomeMail(user.email, user.username);

        return res.status(200).json({ message: 'OTP successfully verified, now proceed to login' });

    } catch (error) {
        throw error;
    }
});

//Route to resend otp
const resendOtp = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        const { error, value } = await resendOtpLinkValidation(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({ error: error.message });
        }

        // Extract the email from the request body
        const { email } = req.body;

        // Check if the provided email is registered 
        const findEmail = await User.findOne({ email: email });
        if (!findEmail) {
            res.status(404).json({ message: 'This email is not registered' });
        }

        // Generate a new OTP code 
        const newOtp = generate2FACode6digits();

        // Send the new OTP code to the user via email
        await otpMail(email, newOtp, findEmail.username);

        // Calculate the expiration time for the new OTP
        const fiveMinutesLater = new Date();
        fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 2);

        // Save the new OTP record to the database
        const sentOtp = new OtpSchema();
        sentOtp.email = findEmail.email;
        sentOtp.otp = newOtp;
        sentOtp.expirationTime = fiveMinutesLater;

        await sentOtp.save();

        res.status(200).json({ message: 'New OTP has been sent, please check your email' });
    } catch (error) {
        throw error;
    }
});

//reset password token
const sendResetPasswordLink = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        const { error, value } = await resendPasswordLinkValidation(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({ message: error.message });
        }

        const { email } = req.body;

        // Check if the provided email is registered in the User collection
        const getEmail = await User.findOne({ email: email });
        if (!getEmail) {
            res.status(404).json({ message: 'Please enter the correct email' });
        }

        // Generate a new password reset token 
        const resetToken = generate2FACode6digits();

        // Save the password reset token 
        getEmail.resetlink = resetToken;
        getEmail.Ispasswordresentlinksent = true;

        // Save the changes to the user's database record
        await getEmail.save();

        // Send the password reset link to the user via email
        await passwordResetLinkMail(email, resetToken, getEmail.username);


        res.status(200).json({ message: 'Password reset token has been sent successfully' });
    } catch (error) {
        throw error;
    }
});

//reset link
const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { error, value } = resetPasswordLinkValidation(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({ message: message.error })
        }
        const { email, password, resetLink } = req.body;

        // Check if the email exists in the database
        const student = await User.findOne({ email });
        if (!student) {
            return res.status(404).json({ message: 'User not found' });
        }

        //validate the link
        if (student.resetLink !== resetLink) {
            res.status(400).json({ message: 'Invalid reset link' })
        }

        // expiration time 
        const resetExpirationTime = new Date()
        resetExpirationTime.setMinutes(resetExpirationTime.getMinutes() + 5)

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password and save it to the database
        student.password = hashedPassword;
        student.resetLinkExpirationTime = resetExpirationTime
        student.isResetPasswordLinkSent = false

        await student.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        throw error
    }
});


//change password
const changePasswordLink = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        const { error, value } = changePasswordValidationLink(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json({ message: error.message })
        }

        // Extract data from the request body
        const { email, existingPassword, newPassword } = req.body;

        // Check if a user with the provided email exists in the database
        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(404).json({ message: 'Check if the email you entered is correct' })
        }

        // Compare the existing password with the hashed password stored in the user object
        if (user && (await bcrypt.compare(existingPassword, user.password))) {
            res.status(200).json({ message: 'User and existing password match' })
        } else {
            res.status(404).json({ message: 'Existing password does not match' })
        }

        // Hash the new password
        const hash = await bcrypt.hash(newPassword, 10)

        // Reset the user's password with the new hashed password
        user.password = hash

        // Save the new password to the database
        await user.save()

        res.status(201).json({ message: 'Password has been changed successfully' })

    } catch (error) {
        throw error
    }
});

//Upate user 
const updateUser = asyncHandler(async (req, res) => {
    const { username } = req.body;

    // Find the user in the database based on the provided ID
    const isUser = await User.findById(req.params.id);

    // Check if the user exists
    if (!isUser) {
        // If the user is not found, throw an error
        throw new Error('User not found');
    }

    // Update the user's username with the new value
    isUser.username = username;

    // Save the updated user in the database
    await User.save(isUser);

    res.status(200).json({ isUser });
});


// //Route to DELETE user
const deleteUser = asyncHandler(async (req, res) => {

    // Find the user in the database based on the provided ID
    const user = await User.findById(req.params.id);

    // Check if the user exists
    if (!user) {
        res.status(404).json({ message: 'Contact not found, please recheck the ID and try again' });
    }

    const userRemove = await User.deleteOne({ _id: req.params.id });
     
    // Respond with a 200 OK status and the deleted user
    res.status(200).json({ message: 'user deleted' });
});


// //Route to GET the current user logged in
const currentUser = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

//Upload profile picture
const uploadNew = asyncHandler(async (req, res) => {

    const { id } = req.params
    try {
        const user = await User.findById(id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }

        const imageUrl = req.file.filename;
        user.profilepics = imageUrl;

        await user.save();
        res.status(200).json({ message: 'Successfully uploaded profile picture' });

    } catch (error) {
        throw error
    }
})


module.exports = {
    getUser,
    getOneUser,
    registerUser,
    registerLinkUser,
    verifyUserOtp,
    verifyUserOtpLink,
    resendOtp,
    sendResetPasswordLink,
    resetPassword,
    changePasswordLink,
    login,
    updateUser,
    deleteUser,
    currentUser,
    uploadNew
} 