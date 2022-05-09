const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const pointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  });

const restaurantSchema = new mongoose.Schema({
    restaurant_name: {
        type: String,
        required: true,
        trim: true
    },
    restaurant_address: {
        type: String,
        required: true
    },
    restaurant_location: {
        type: {
            type: String,
            enum: ['Point']
          },
          coordinates: {
            type: [Number]
          }
    },
    restaurant_phone: {
        type: String,
        unique: true,
        trim: true,
        validate(value) {
            var len = value.length
            var val = Number(value)
            if ((val === NaN) || (len > 10) || (len < 10)) {
                if (!validator.isNumeric(val)) {
                    throw new Error('Not a phone number')
                }
            }
        }
    },
    landline_phone: {
        type: String,
        unique: true,
        trim: true,
        validate(value) {
            var len = value.length
            var val = Number(value)
            if ((val === NaN) || (len > 11) || (len < 11)) {
                if (!validator.isNumeric(val)) {
                    throw new Error('Not a phone number')
                }
            }
        }
    },
    owner_phone: {
        type: String,
        unique: true,
        trim: true,
        validate(value) {
            var len = value.length
            var val = Number(value)
            if ((val === NaN) || (len > 10) || (len < 10)) {
                if (!validator.isNumeric(val)) {
                    throw new Error('Not a phone number')
                }
            }
        }
    },
    owner_name: {
        type: String,
        trim: true
    },
    restaurant_email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    establishment_type:[String],
    cuisines: [String],
    operational_hours: {
        type: String
    },
    /* operational_hours: {
        type: Date, 
        default: new Date()
    }, */
    operational_days: [String],
    avatar: {
        type: Buffer
    },
    gallery_images:[Buffer],
    user_name: {
        type: String,
        trim: true
    },
    buisness_verified:{
        type: Boolean,
        default: true
    },
	password: {
        type: String,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
   userUpdatedPassword: {
    type: Boolean,
    default: true 
  }, 
    tokens: [{
        token: {
            type: String,
            required: true
        }
  }],
   activeUrl: [{
    Otp: String,
    issuedAt: Date,
    expiry: Date
  }] 
}, {
    timestamps: true
})

restaurantSchema.virtual('offers', {
    ref: 'Offer',
    localField: '_id',
    foreignField: 'owner'
})

restaurantSchema.methods.toJSON = function () {
    const restaurant = this
    const restaurantObject = restaurant.toObject()

    delete restaurantObject.password
    delete restaurantObject.tokens

    return restaurantObject
}

restaurantSchema.methods.generateAuthToken = async function () {
  const restaurant = this
  const token = jwt.sign({ _id: restaurant._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" })

    restaurant.tokens = restaurant.tokens.concat({ token })
    await restaurant.save()

    return token
}

restaurantSchema.methods.generateTokenUrl = async function () {
  const restaurant = this
  const Otp = Math.floor(1000 + Math.random() * 9000);
  const issuedAt = new Date();
  const currentTime = new Date();
  const expiry = new Date(currentTime.setSeconds(currentTime.getSeconds() + 60));
  restaurant.activeUrl = restaurant.activeUrl.concat({
    Otp,
    issuedAt,
    expiry
  })
  await restaurant.save()

  return Otp
}

restaurantSchema.statics.findByCredentials = async (email, password) => {
    const restaurant = await Restaurant.findOne({ email })

    if (!restaurant) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, restaurant.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return restaurant
}

restaurantSchema.pre('save', async function (next) {
    const restaurant = this
	
    if (restaurant.isModified('password')) {
        restaurant.password = await bcrypt.hash(restaurant.password, 8)
    }

    next()
})

/* restaurantSchema.path('website').validate((val) => {
    urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
    return urlRegex.test(val);
}, 'Invalid URL.'); */

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

module.exports = Restaurant
