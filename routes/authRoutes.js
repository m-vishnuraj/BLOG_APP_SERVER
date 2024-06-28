const express = require('express');

const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { userProtect } = require('../middlewares/authMiddlewares');

router.post('/register', registerUser);
router.post('/login', loginUser);
// test Get
router.get('/test', userProtect, (req, res) => {
    res.json({
        user: req.user,
    });
});

module.exports = router;