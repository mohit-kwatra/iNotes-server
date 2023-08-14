const mongoose = require('mongoose')

const NotesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        default: "General"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const NotesModel = new mongoose.model('notes', NotesSchema)

module.exports = NotesModel