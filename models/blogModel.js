const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        url: String,
        key: String,
    },
},
    {
        timestamps: true
    },
);

module.exports = mongoose.model('Blog', blogSchema);