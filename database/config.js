const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const mongoURI = process.env.CONNECTION_STRING
const connect = () => {
    mongoose
    .connect(mongoURI)
    .then(() => {
        console.log("[+] Connected to MongoDB.")
    })
}

module.exports = {connect}