const jwt = require('jsonwebtoken');

// Middleware to authenticate user and attach user data to req.user
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the authorization header is present and properly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Authorization header missing or malformed.' });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(' ')[1]; 

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user info to req.user directly from the decoded payload
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            email: decoded.email,
            // You can add other properties if needed
        };

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).send({ message: 'Invalid or expired token.' });
    }
};

module.exports = authenticateUser;
