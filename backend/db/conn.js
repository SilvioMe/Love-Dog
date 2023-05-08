const mongoose = require('mongoose')

async function main () {
    await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0j.1zvyynh.mongodb.net/${process.env.MONGODB_DB}`)
    console.log('Connected to Mongoose!')
}

main().catch((err) => console.log(err))

module.exports = mongoose