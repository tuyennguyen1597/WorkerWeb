const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    //Check no token
    if (!token) {
        return res.status(401).json({ msg: "No token, Authentization denied" });
    }

    try {
        //Verify token
        const decode = jwt.verify(token, config.get("jsonSecret"));
        req.user = decode.user;
        next();
    } catch (error) {
        console.error(error.message);
        res.status(401).send("Invalid token");
    }

}
