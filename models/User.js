const mongoose =  require('mongoose')

let UserSchema =  new mongoose.Schema({

    name: {
        type: String,
        required: true,
        index: true

    },

    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
    },
    status: {
        type: String,
        required: true,
    },
    poste : {
        type: String,
        required: true
    },
    telephone: {
        type: Number,
    },
    password : {
        type: String,
        required:  true,
        select : false
    },
    presence: {
        type: Array,
    },
    created_at: {
        type: String
    }
    
}, {
    toJSON: { virtuals:  true},
    toObject: { virtuals:  true},
    timestamps: true
})

module.exports = mongoose.model('user', UserSchema)


