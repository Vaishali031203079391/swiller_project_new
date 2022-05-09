const mongoose = require('mongoose')
const restaurant = require('./restaurant')

const offerSchema = new mongoose.Schema({
    offer_id:{
        type: String
    },
    offer_title:{
        type: String
    },
    category:{
        type: String
    },
    offer:{
        type: String
    },
    dress_code:{
        type: String
    },
    description:{
        type: String
    },
    start_date:{
        type: Date
    },
    end_date:{
        type: Date
    },
    start_time:{
        type: String
    },
    end_time:{
        type: String
    },
    close_bookings_by:{
        type: String
    },
    repeat_offer:{
        type: String
    },
    no_of_tables:{
        type: Number
    },
    time_slot:[String],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    avatar: {
        type: Buffer
    },
    offerImages: [{
        type: Buffer
    }]/* ,
    tasknotes: {
        type: Buffer
    },
    buyers: [{
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    }] */
}, {
    timestamps: true
})

//taskSchema.virtual('', {
//    ref: 'Student',
//    localField: '_id',
//    foreignField: 'tasks'
//})

offerSchema.methods.toJSON = function () {
    const offer = this
    const offerObject = offer.toObject()

    return offerObject
}

offerSchema.methods.addBuyer = async function (id) {
    const offer = this
    const check = offer.buyers
    const buyer = id
    const oldBuyer = false
    for (b of check) {
        if (b.buyer.toString() == buyer) {
            oldBuyer = true
            break
        }
    }
    if (!oldBuyer) {
        offer.buyers = offer.buyers.concat({ buyer })

        await offer.save()
        return buyer
    }
    return res.status(500).send(e)
   
}

const Offer = mongoose.model('Offer', offerSchema)

module.exports = Offer
