const jwt = require('jsonwebtoken');

exports.userProtect = (req, res, next) => {
    // Get the token from the header
    const token = req.header('auth-token');

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            message: 'Not authorized to access this route',
            success: false,
            statusCode: 401,
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Not authorized to access this route',
            success: false,
            statusCode: 401,
        });
    }

}


exports.testUserProtect = (req, res, next) => {
    res.json({
        message: 'Not authorized to access this route',
    });
}