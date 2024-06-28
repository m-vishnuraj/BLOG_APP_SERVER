const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require("cors");

const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');

dotenv.config();

const app = express();

// ! DB Connection
mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
}).then(() => console.log('MongoDB connected!'))
    .catch(err => console.log(err));

// ! Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());


app.use('/api', authRoutes);
app.use('/api', blogRoutes);
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
);