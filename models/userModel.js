const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female", "other"],
    },
    profilePicture: {
        type: String,
        default: 'https://i.pinimg.com/originals/88/c5/43/88c543e07e766567fb8e797f88d61dff.jpg',
    },
},
    {
        timestamps: true
    },
);


module.exports = mongoose.model('User', userSchema);