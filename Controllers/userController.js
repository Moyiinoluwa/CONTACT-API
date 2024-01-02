const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Model/userSchema'); 
const { signupValidation,
    verifyOtpValidation,
    resendOtpLinkValidation,
    resendPasswordLinkValidation,
    resetPasswordLinkValidation,
    changePasswordValidationLink,
    loginUserValidation } = require('../Validator/validationSchema')
const { otpMail, welcomeMail, passwordResetLinkMail } = require('../Shared/mailer');
const OtpSchema = require('../Model/otpSchema');
const ContactSchema = require('../Model/contactSchema')
const Joi = require('joi');
const { mailService } = require('../services/mailer.service');
const Upload = require('../Middleware/uploadFile')


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
        // If the user is not found, respond with a 404 Not Found status and throw an error
        res.status(404);
        throw new Error('Contact not found, check again');
    }

    // Respond with a 200 OK status and the user's information as JSON
    res.status(200).json(user);
});


//POST Route to register a new user api/user/register
const registerUser = asyncHandler(async (req, res) => {
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

        // Return a success response
        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        throw error
    }
});


//POST Route to register a new user api/user/register
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
        await fiveMinuteslater.setMinutes(fiveMinuteslater.getMinutes() + 20)

        const sentOtp = new OtpSchema()
        sentOtp.email = user.email
        sentOtp.otp = verificationCode
        sentOtp.expirationTime = fiveMinuteslater

        await sentOtp.save()

        // Return a success response
        return res.status(201).json({ message: 'User registered' });
    } catch (error) {
        throw error
    }
});



//Route to POST user login /api/user/login
const login = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        const { error, value } = loginUserValidation(req.body, { abortEarly: false });
        if (error) {
            // If validation fails, respond with a 400 Bad Request status and an error message
            res.status(400).json({ message: error.message });
        }

        // Extract data from the request body
        const { email, password } = req.body;

        // Find a user with the provided email in the database
        const user = await User.findOne({ email });

        // Compare the password provided in the request with the hashed password stored in the user object
        if (user && (await bcrypt.compare(password, user.password))) {
            // If the passwords match, generate a JSON Web Token (JWT) for authentication
            const accessToken = jwt.sign({
                user: {
                    username: user.username,
                    email: user.email,
                    id: user.id
                }
            },
                process.env.SECRET, // Use the secret key to sign the token

                // Set the token's expiration time (e.g., 1 year)
                { expiresIn: '1y' },
            );

            // Respond with a 200 OK status and the JWT token for successful login
            res.status(200).json({ accessToken });
        } else {
            // If the passwords do not match, respond with a 401 Unauthorized status and an error message
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
            // If validation fails, return a 400 Bad Request response with a validation error message
             res.status(400).json({ error: error.message });
        }

        // Extract data from the request body
        const { email, otp } = req.body;

        // Check if an OTP record with the provided email exists in the database
        const verifyEmail = await OtpSchema.findOne({ email: email });
        if (!verifyEmail) {
            // If no record is found, respond with a 404 Not Found status and an error message
             res.status(404).json({ message: 'The email does not match the email the OTP was sent to' });
        }

        // Check if an OTP record with the provided OTP code exists in the database
        const checkOtp = await OtpSchema.findOne({ otp: otp });
        if (!checkOtp) {
            // If no record is found, respond with a 404 Not Found status and an error message
             res.status(404).json({ message: 'Incorrect OTP, please check your email again' });
        }

        // Check if the OTP has expired (compare with the current time)
        if (checkOtp.expirationTime <= new Date()) {
            // If the OTP has expired, respond with a 403 Forbidden status and an error message
            res.status(403).json({ message: 'OTP expired, please request for another one' });
        }

        // Update the 'verified' status of the OTP record to indicate it has been verified
        checkOtp.verified = true;
        await checkOtp.save();

        // Find the user associated with the provided email
        const user = await User.findOne({ email: email });
        if (!user) {
            // If the user is not found, respond with a 404 Not Found status and an error message
            res.status(404).json({ message: 'User does not exist' });
        }
        user.Isverified = true;
        await user.save()

        // Send a welcome email to the user after OTP verification
        await welcomeMail(user.email, user.username);

        // Respond with a 200 OK status and a success message
        return res.status(200).json({ message: 'OTP successfully verified, now proceed to login' });

    } catch (error) {
        // If an error occurs during the process, throw the error
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
            // If no record is found, respond with a 404 Not Found status and an error message
             res.status(404).json({ message: 'The email does not match the email the OTP was sent to' });
        }

        // Check if an OTP record with the provided OTP code exists in the database
        const checkOtp = await OtpSchema.findOne({ otp: token });
        if (!checkOtp) {
            // If no record is found, respond with a 404 Not Found status and an error message
             res.status(404).json({ message: 'Incorrect OTP, please check your email again' });
        }

        // Check if the OTP has expired (compare with the current time)
        if (checkOtp.expirationTime <= new Date()) {
            // If the OTP has expired, respond with a 403 Forbidden status and an error message
            res.status(403).json({ message: 'OTP expired, please request for another one' });
        }

        // Update the 'verified' status of the OTP record to indicate it has been verified
        checkOtp.verified = true;
        await checkOtp.save();

        // Find the user associated with the provided email
        const user = await User.findOne({ email: email });
        if (!user) {
            // If the user is not found, respond with a 404 Not Found status and an error message
            res.status(404).json({ message: 'User does not exist' });
        }
        user.Isverified = true;
        await user.save()

        // Send a welcome email to the user after OTP verification
        await welcomeMail(user.email, user.username);

        // Respond with a 200 OK status and a success message
        return res.status(200).json({ message: 'OTP successfully verified, now proceed to login' });

    } catch (error) {
        // If an error occurs during the process, throw the error
        throw error;
    }
});


//Route to resend otp
const resendOtp = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        const { error, value } = await resendOtpLinkValidation(req.body, { abortEarly: false });
        if (error) {
            // If validation fails, return a 400 Bad Request response with a validation error message
            res.status(400).json({ error: error.message });
        }

        // Extract the email from the request body
        const { email } = req.body;

        // Check if the provided email is registered in the API
        const findEmail = await User.findOne({ email: email });
        if (!findEmail) {
            // If the email is not found, respond with a 404 Not Found status and an error message
            res.status(404).json({ message: 'This email is not registered' });  
        }

        // Generate a new OTP code (presumably a 6-digit code)
        const newOtp = generate2FACode6digits();

        // Send the new OTP code to the user via email
        await otpMail(email, newOtp, findEmail.username);

        // Calculate the expiration time for the new OTP (1 minute from now)
        const fiveMinutesLater = new Date();
        fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 2);

        // Create a new instance of the OtpSchema model (assuming it's a Mongoose model)
        const sentOtp = new OtpSchema();

        // Set the email, OTP code, and expiration time for the new OTP record
        sentOtp.email = findEmail.email;
        sentOtp.otp = newOtp;
        sentOtp.expirationTime = fiveMinutesLater;

        // Save the new OTP record to the database
        await sentOtp.save();

        // Respond with a 200 OK status and a success message
        res.status(200).json({ message: 'New OTP has been sent, please check your email' });
    } catch (error) {
        // If an error occurs during the process, throw the error
        throw error;
    }
});

//reset password token
const sendResetPasswordToken = asyncHandler(async (req, res) => {
    try {
        // Validate the incoming request body using a validation function
        const { error, value } = await resendPasswordLinkValidation(req.body, { abortEarly: false });
        if (error) {
            // If validation fails, respond with a 400 Bad Request status and an error message
            res.status(400).json({ message: error.message });
        }

        // Extract the email from the request body
        const { email } = req.body;

        // Check if the provided email is registered in the User collection
        const getEmail = await User.findOne({ email: email });
        if (!getEmail) {
            // If the email is not found, respond with a 404 Not Found status and an error message
            res.status(404).json({ message: 'Please enter the correct email' });
        }

        // Generate a new password reset token (assumed to be a 6-digit code)
        const resetToken = generate2FACode6digits();

         // Save the password reset token and set a flag in the user's database record
        getEmail.resetlink = resetToken;
        getEmail.Ispasswordresentlinksent = true;

        // Save the changes to the user's database record
        await getEmail.save();

        // Send the password reset link to the user via email (using the passwordResetLinkMail function)
        await passwordResetLinkMail(email, resetToken, getEmail.username);

        // Respond with a 200 OK status and a success message
        res.status(200).json({ message: 'Password reset token has been sent successfully' });
    } catch (error) {
        // If an error occurs during the process, throw the error
        throw error;
    }
});

//reset link

const finallyResetPassword = asyncHandler(async (req, res) => { 
    try {
        const { error, value } = resetPasswordLinkValidation(req.body, { abortEarly: false });
        if (error) {
            res.status(400).json({ message: message.error })
        }
        const { email, password } = req.body;

        // Check if the email exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        //validate the token

        // expiration time 
        const resetExpirationTime = new Date()
        resetExpirationTime.setMinutes(resetExpirationTime.getMinutes() + 2)

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password and save it to the database
        user.password = hashedPassword;
        await user.save();

        // You may also want to invalidate the reset token here if you're using one

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
            // If validation fails, respond with a 400 Bad Request status and an error message
            res.status(400).json({ message: error.message })
        }

        // Extract data from the request body
        const { email, existingPassword, newPassword } = req.body;

        // Check if a user with the provided email exists in the database
        const user = await User.findOne({ email: email })
        if (!user) {
            // If the user is not found, respond with a 404 Not Found status and an error message
            res.status(404).json({ message: 'Check if the email you entered is correct' })
        }

        // Compare the existing password with the hashed password stored in the user object
        if (user && (await bcrypt.compare(existingPassword, user.password))) {
            // If the passwords match, respond with a 200 OK status and a success message
            res.status(200).json({ message: 'User and existing password match' })
        } else {
            // If the passwords do not match, respond with a 404 Not Found status and an error message
            res.status(404).json({ message: 'Existing password does not match' })
        }

        // Hash the new password
        const hash = await bcrypt.hash(newPassword, 10)

        // Reset the user's password with the new hashed password
        user.password = hash

        // Save the new password to the database
        await user.save()

        // Respond with a 201 Created status and a success message
        res.status(201).json({ message: 'Password has been changed successfully' })

    } catch (error) {
        // If an error occurs during the process, throw the error
        throw error
    }
});

//Upate user with the PUT Route
const updateUser = asyncHandler(async (req, res) => {
    // Extract the new username from the request body
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

    // Respond with a 200 OK status and the updated user information
    res.status(200).json({ isUser });
});


// //Route to DELETE user
const deleteUser = asyncHandler(async (req, res) => {

    // Find the user in the database based on the provided ID
    const user = await User.findById(req.params.id);

    // Check if the user exists
    if (!user) {
        // If the user is not found, respond with a 404 Not Found status and an error message
        res.status(404);
        throw new Error('Contact not found, please recheck the ID and try again');
    }

    // If the user exists, casade delete the user from the database
    await ContactSchema.deleteMany({ user: user_id })
    await OtpSchema.deleteMany({ user: user_id })


    // Respond with a 200 OK status and the deleted user
    res.status(200).json({ message: 'user deleted' });
});


// //Route to GET the current user information /api/user/current
const getCurrent = asyncHandler(async (req, res) => {
    // Log the user object to the console (for debugging or logging purposes)
    console.log(req.user);

    // Respond with a 200 OK status and the current user's information as JSON
    res.status(200).json(req.user);
});


const userUpload = asyncHandler(async (req, res) => {
    try {
        Upload(req, res, (err) => {
            if (err) {
                console.log(err);
            }

            // Assuming you have other fields in your request body, make sure to include them
            const { username, email, password } = req.body;

            // Validate if required fields are present
            if (!username|| !email || !password ) {
                res.status(400).json({ error: 'Please provide all required fields' });
            }

            const newUser = new User({
                username,
                email,
                password,
                profilepics: {
                    name: req.body.name,
                    image: {
                        data: req.file.filename,
                        contentType: 'image/png',
                    }
                }
            });

            newUser.save()
                .then(() => res.status(200).json({ message: 'Successfully uploaded profile picture' }))
                .catch((err) => {
                    console.log(err);
                });
        });
    } catch (error) {
        console.error(error);
    }
});

module.exports = {
    getUser,
    getOneUser,
    registerUser,
    registerLinkUser,
    verifyUserOtp,
    verifyUserOtpLink,
    resendOtp,
    sendResetPasswordToken,
    finallyResetPassword,
    changePasswordLink,
    login,
    updateUser,
    deleteUser,
    getCurrent,
    userUpload
} 