
const mongoose = require('mongoose')

let AdminSchema  = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique : true,
    },
    telephone:{
        type: Number,
    },
    password: {
        type: String,
        required: true,
        select: false
    }

}, {
    toJSON: {virtuals: true},
    toObject:  { virtuals: true},
    timestamps: true
})

module.exports = mongoose.model('admin', AdminSchema)