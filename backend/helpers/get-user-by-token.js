const jwt = require('jsonwebtoken')

const User = require('../models/User')

// Get user by jwt token
const getUserByToken = async (token) => {
    if (!token) {
        return resizeBy.status(401).json({message: 'Access denied!'})
    }
    const decoded = jwt.verify(token, 'nossosecret')

    const userId = decoded.id 

    const user = await User.findOne({ _id: userId})

    return user
}

module.exports = getUserByToken