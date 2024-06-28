const User = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/authUtils');
const jwt = require('jsonwebtoken');

// ! Register User

exports.registerUser = async (req, res) => {
    try {
        // Extract user details from the request body
        const { email, password, name, gender, profilePicture } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists',
                success: false,
                statusCode: 2,
            });
        }

        if (!email || !password || !name) {
            return res.status(400).json({
                message: 'Please provide all required fields',
                success: false,
                statusCode: 2,
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long',
                success: false,
                statusCode: 2,
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            gender,
            profilePicture,
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Create a JWT token
        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Respond with the saved user (excluding the password)
        // const userResponse = savedUser.toObject();
        // delete userResponse.password;

        res.status(201).json({
            message: 'User registered successfully',
            success: true,
            statusCode: 1,
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                token,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            success: false,
            statusCode: 0,
        });
    }
};

// ! Login User

exports.loginUser = async (req, res) => {
    try {
        // Extract user details from the request body
        const { email, password } = req.body;

        console.log(email, password);

        // Check if the user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({
                message: 'Invalid Email',
                success: false,
                statusCode: 2,
            });
        }

        // Compare the password
        const passwordMatch = await comparePassword(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(400).json({
                message: 'Invalid Password',
                success: false,
                statusCode: 2,
            });
        }

        // Create a JWT token
        const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Respond with the user (excluding the password)
        // const userResponse = existingUser.toObject();
        // delete userResponse.password;

        res.status(200).json({
            message: 'User logged in successfully',
            success: true,
            statusCode: 1,
            data: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                token,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message,
            success: false,
            statusCode: 0,
        });
    }
}