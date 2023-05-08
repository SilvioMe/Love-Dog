const Pet = require('../models/Pet')


// Helpers
const getToken = require("../helpers/get-token")
const getUserByToken = require("../helpers/get-user-by-token")
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class PetController {

    static async create(req, res) {
        
        const {name, age, weight, color} = req.body
        const images = req.files
        const available = true

        // Images upload

        // Validations

        if (!name){
            res.status(400).json({message: "Dog's name is required!"})
            return
        }

        if (!age){
            res.status(400).json({message: "Dog's age is required!"})
            return
        }

        if (!weight){
            res.status(400).json({message: "Dog's weight is required!"})
            return
        }

        if (!color){
            res.status(400).json({message: "Dog's color is required!"})
            return
        }

        if (images.length === 0){
            res.status(400).json({message: "Dog's images are required!"})
            return
        }

        // Get pet owner
        const token = getToken(req)
        const user = await getUserByToken(token)

        // Create a dog

        const dog = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone
            }
        })

        images.map((image) => {
            dog.images.push(image.filename)
        })

        try {
            const newDog = await dog.save()
            res.status(201).json({message: "Dog registered with success!", newDog})
        } catch (error) {
            res.status(500).json({message: error})
        }
    }

    static async getAll(req, res){
        const pets = await Pet.find().sort('-createdAt')
        res.status(200).json({pets: pets})
    }

    static async getAllUserPets(req, res) {

        // Get user from token
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({"user._id":user._id}).sort('-createdAt')

        res.status(200).json({pets})
    }

    static async getAllUserAdoptions(req, res){

        // Get user from token
        const token = getToken(req)
        const user = await getUserByToken(token)

        const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')

        res.status(200).json({pets})
    }

    static async getPetById(req, res){

        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.status(422).json({message: 'Invalid ID!'})
            return
        }

        // Check if pet exists
        const pet = await Pet.findOne({ _id:id})

        if (!pet){
            res.status(404).json({message: 'Dog not found!'})
        }

        res.status(200).json({pet: pet})

    }

    static async removePetById(req, res){
        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.status(422).json({message: 'Invalid ID!'})
            return
        }

        // Check if pet exists
        const pet = await Pet.findOne({ _id:id})

        if (!pet) {
            res.status(404).json({message: "Dog not found!"})
            return
        }

        // Check if person logged in is the same person who registered the dog

        const token = getToken(req)
        const user = await getUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({message: "You can't delete a pet which you didn't have registered."})
            return
        } else {
            await Pet.deleteOne({ _id:id})

            res.status(200).json({message: 'Dog removed with success!'})
        }

        
    }

    static async updatePet(req, res) {
        
        const id = req.params.id
        const {name, age, weight, color, available} = req.body
        const images = req.files
        const updateData = {}

        // Check if pet exists
        const pet = await Pet.findOne({_id:id})

        if(!pet){
            res.status(404).json({message: "Dog not found!"})
            return
        }

        // Check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        // Validations
        if (pet.user._id.toString() !== user._id.toString()){
            res.status(422).json({message: "You can't update a pet which you didn't have registered."})
            return
        }

        if (!name){
            res.status(400).json({message: "Dog's name is required!"})
            return
        } else {
            updateData.name = name
        }

        if (!age){
            res.status(400).json({message: "Dog's age is required!"})
            return
        } else {
            updateData.age = age
        }

        if (!weight){
            res.status(400).json({message: "Dog's weight is required!"})
            return
        } else {
            updateData.weight = weight
        }

        if (!color){
            res.status(400).json({message: "Dog's color is required!"})
            return
        } else {
            updateData.color = color
        }

        if (images.length > 0){
            updateData.images = [0]
            images.map((image) => {
                updateData.images.push(image.filename)
            })
        }

        await Pet.findByIdAndUpdate(id, updateData)

        return res.status(201).json({message: "Dog profile updated with success!"})
    }

    static async schedule(req, res) {

        const id = req.params.id

        // Check if pet exists
        const pet = await Pet.findOne({ _id: new ObjectId(id) })

        console.log(pet)

        if(!pet){
            res.status(404).json({message: "Dog not found!"})
            return
        }

        // Check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        

        // Check if user registered the pet
        if (pet.user._id.equals(user._id)){
            res.status(422).json({message: "You can't book a visit for your own dog."})
            return
        }

        // Check if user has already scheduled a visit
        if (pet.adopter) {
            if (pet.adopter._id.equals(user._id)) {
                res.status(422).json({message: "You have already booked a visit!"})
                return
            }
        }

        // Add user to pet
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image
        }

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({message: `Your visit was booked successfully, please get in touch with ${pet.user.name} by the number ${pet.user.phone}.`})

    }

    static async concludeAdoption(req, res){
        const id = req.params.id

        if (!ObjectId.isValid(id)) {
            res.status(422).json({message: 'Invalid ID!'})
            return
        }

        // Check if pet exists
        const pet = await Pet.findOne({ _id:id})

        if (!pet){
            res.status(404).json({message: 'Dog not found!'})
            return
        }

        // Check if logged in user registered the pet
        const token = getToken(req)
        const user = await getUserByToken(token)

        // Validations
        if (pet.user._id.toString() !== user._id.toString()){
            res.status(422).json({message: "You didn't apply for addopt this dog, please verify the correct ID."})
            return
        }

        pet.available = false
        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({message: "Congratulations! You successfully completed the addoption process!"})
    }
}
