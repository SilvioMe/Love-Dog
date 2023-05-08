const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { mongoose } = require('mongoose')

// Helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
    static async register(req, res) {
        const {name, email, phone, password, confirmpassword} = req.body
        

        // Validations
        if (!name){
            res.status(422).json({message: 'Name is required'})
        }

        if (!email){
            res.status(422).json({message: 'Email is required'})
        }

        if (!phone){
            res.status(422).json({message: 'Phone is required'})
        }

        if (!password){
            res.status(422).json({message: 'Password is required'})
        }

        if (!confirmpassword){
            res.status(422).json({message: 'Password confirmation is required'})
        }

        // Validate passwords

        if (password !== confirmpassword){
            res.status(422).json({message: 'The passwords entered are different!'})
            return
        }

        // Validate user

        const userExists = await User.findOne({email:email})

        if (userExists){
            res.status(422).json({message: 'Email already in use! Try another one.'})
            return
        }

        // Create a password
        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        // Create a user
        const user = new User({
            name,
            email,
            phone,
            password: passwordHash,
        })


        try {
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
        } catch (error) {
            res.status(500).json({message: error})
        }


    }

    static async login(req, res){

        const {email, password} = req.body

        if (!email){
            res.status(422).json({message: "Email is required"})
            return
        }

        if (!password){
            res.status(422).json({message: "Password is required"})
            return
        }

        // Check if user exists
        const user = await User.findOne({email:email})

        if (!user){
            res.status(422).json({message: "User doesn't exist. Please verify your email or sign up."})
            return
        }

        // Check if password match with db password
        const checkPassword = await bcrypt.compare(password, user.password)

        if (!checkPassword){
            res.status(422).json({message: "Please verify your password!"})
            return
        }

        await createUserToken(user, req, res)
    }

    static async checkUser(req, res) {

        let currentUser

        console.log(req.headers.authorization)

        if (req.headers.authorization) {
            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret')

            currentUser = await User.findById(decoded.id)
            currentUser.password = undefined

        } else {
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res) {

        try {
            
            const id = new mongoose.Types.ObjectId(req.params.id)
            const user = await User.findById(id).select("-password")

            res.status(201).json({user})
            
        } catch (error) {
            return res.status(422).json({message: "User not found!"})
        }
    }

    static async editUser(req, res) {

        // Check if user exists
        const token = getToken(req)
        const user = await getUserByToken(token)

        const {name, email,phone, password, confirmpassword} = req.body

        
        // Validations

        if (req.file) {
            user.image = req.file.filename
        }
        
        if (!name) {
            res.status(422).json({message: "Name is required!"})
            return
        }
        user.name = name

        
        if (!email) {
            res.status(422).json({message: "Email is required!"})
            return
        }
        user.email = email

        // Check if email has already taken
        const userExists = await User.findOne({email: email})

        if (user.email !== email && userExists) {
            res.status(422).json({message: "This email is already in use! Please, try another one."})
            return
        }

        
        if (!phone) {
            res.status(422).json({message: "Phone is required!"})
            return
        }
        console.log(phone)
        user.phone = phone

        
        if (!password) {
            res.status(422).json({message: "Password is required!"})
            return
        }

        if (!confirmpassword) {
            res.status(422).json({message: "Password is required!"})
            return
        }

        // Check if passwords match
        if (password !== confirmpassword) {
            res.status(422).json({message: "The passwords entered are different!"})
            return
        } else if (password === confirmpassword && password != null) {
            
            // Creating password
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash
        }

        console.log(user.name, user.email, user.phone, user.password)

        try {
            // Returns user updated data
            await User.findOneAndUpdate(
                { _id: user._id },
                { $set: user },
                { new: true },
            )

            res.status(200).json({
                message: "User information successfully updated!"
            })
        } catch (error) {
            res.status(500).json({ message: error})
            return
        }

    }
}