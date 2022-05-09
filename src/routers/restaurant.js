//Import express for Router setup
//Models - Restaurant, Student 

const express = require('express')
const auth = require('../middleware/auth')
const Restaurant = require('../models/restaurant')
const multer = require('multer')
const sharp = require('sharp')
//const { sendWelcomeEmail, sendCancelationEmail, sendOtpEmail, sendNewPasswordEmail } = require('../emails/account')
const router = new express.Router()

// Routes

//------------------------------REGISTRATION AND LOGIN ROUTES---------------------------------------------------

// Forgot Password-

router.post('/forgot-password', async (req, res) => {
  const email = req.body.email

  //console.log(email)
  //console.log(domain)
  const restaurant = await Restaurant.findOne({ email: email })
  if (restaurant) {
    if (restaurant.activeUrl != []) {
      restaurant.activeUrl = [];
      await restaurant.save()
    }
    const Otp = await Restaurant.generateTokenUrl()
    //sendOtpEmail(Restaurant.email, Otp)
    return res.status(200).json({
      msg: "OTP send to email",
      otp: Otp
    })
  } else {
    return res.status(400).json({
      msg: "Not registered please register!"
    })
  }
});

router.post('/validate-otp', async (req, res) => {
  const email = req.body.email
  const otp = req.body.otp
  const password = Math.random().toString(36).substring(2, 10);
  const userUpdatedPassword = false;

  const restaurant = await Restaurant.findOne({ email: email })

    if (!restaurant) {
      return res.status(400).json({
        msg: "No such restaurant!"
      })
    }

    restaurant.activeUrl.forEach(function (otpData) {
      if ((otpData.Otp == otp) && (otpData.expiry > new Date())) {
        OTP_CURRENT = true
      } else {
        OTP_CURRENT = false
      }
    })
    if (OTP_CURRENT) {
      restaurant.activeUrl = [];
      restaurant.confirmpassword = password;
      restaurant.RestaurantUpdatedPassword = RestaurantUpdatedPassword;
      await restaurant.save()
      //sendNewPasswordEmail(Restaurant.email, Restaurant.name, password)
      return res.status(200).json({
        msg: "New Password sent to your Email",
        restaurant: Restaurant,
        password: password,
        userUpdatedPassword: userUpdatedPassword
      })
    } else {
      restaurant.activeUrl = [];
      await restaurant.save()
      return res.status(500).json({
        msg: "Invalid OTP try again!"
      })
    }
})

// 1)--------------------REGISTRATION

router.post('/register', async (req, res) => {
    const temp = {
      restaurant_name: req.body.restaurant_name,
      restaurant_address: req.body.restaurant_address,
      restaurant_location: req.body.restaurant_location,
      restaurant_phone: req.body.restaurant_phone,
      landline_phone: req.body.landline_phone,
      owner_name: req.body.owner_name,
      owner_phone: req.body.owner_phone,
      restaurant_email: req.body.restaurant_email,
      establishment_type: req.body.establishment_type,
      cuisines: req.body.cuisines,
      operational_hours: req.body.operational_hours,
      operational_days: req.body.operational_days,
      user_name: req.body.restaurant_email,
      buisness_verified: true,
      password: 'vaishali123'
    };

    const restaurant = new Restaurant(temp)
    console.log(restaurant);
    try {
      await restaurant.save()
      //sendWelcomeEmail(Restaurant.email, Restaurant.name)
      //const token = await restaurant.generateAuthToken()
	  
      res.status(201).json({
        msg: 'Restaurant Created!',
        restaurant: restaurant,
        username: restaurant.restaurant_email,
        password: 'vaishali123'
      })
    } catch (e) {
    var msg;
	  console.log(e);

       if (e.keyValue.phone) {
        //console.log(e.keyValue.phone)
        msg = "Phone No already enrolled"
      } else if (e.keyValue.email) {
        console.log(e.keyValue.email)
        msg = "Email already enrolled"
      } else if ((e.keyValue.email) && (e.keyValue.phone)) {
        msg = "Email and Phone No already enrolled"
      } else {
        msg = e
      } 

      res.status(400).json({
        msg: msg
      })
    }
  })

router.post('/login', async (req, res) => {
	console.log(req.body);
    const email = req.body.email
    const password = req.body.password

    try {
      const restaurant = await Restaurant.findByCredentials(email, password)
      const token = await restaurant.generateAuthToken()
    res.status(200).json({
      restaurant: restaurant,
      token: token,
      expiresIn: 3600
    })
  } catch (e) {
    console.log(e)
    res.status(400).json({
      error: e,
      msg: 'Auth Failed!..Not Registered'
    })
  }

})

router.post('/restaurants/logout', auth, async (req, res) => {
    //console.log(req.Restaurant)
    try {
        req.restaurant.tokens = req.restaurant.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.restaurant.save()

      res.status(200).json({
        msg: 'You are now logged out!'
      })
    } catch (e) {
      res.status(500).json({
        error: e
      })
    }
})

router.post('/restaurants/logoutAll', auth, async (req, res) => {

    try {
        req.restaurant.tokens = []
        await req.restaurant.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//-------------------------------------RestaurantS---------------------------------------------------------

//--------PROFILE DETAILS OF 

// 1) VIEW PROFILE ROUTES

router.get('/profile/me', auth, async (req, res) => {
  res.json({
    restaurant: req.restaurant
  })
})


// 2) UPDATE PROFILE ROUTES

router.patch('/restaurants/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'confirmpassword', 'userUpdatedPassword', 'address', 'city', 'state', 'country', 'speciality', 'website', 'pricerange']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.restaurant[update] = req.body[update])
        await req.restaurant.save()
      res.json({
        restaurant: req.restaurant,
        token: req.restaurant.token,
        expiresIn: 3600,
      })
    } catch (e) {
      res.status(400).json({
        error: e
      })
    }
})

// DELETE ACCOUNT ROUTES-

router.delete('/restaurants/me', auth, async (req, res) => {
    const email = req.restaurant.email
    const name = req.restaurant.name

    try {
        await req.restaurant.remove()
        //sendCancelationEmail(email, name)
        res.send('Bye Bye')
    } catch (e) {
        res.status(500).send()
    }
})

//------------------------------------------IMAGE UPLOADS-----------------------------------------------------------

const upload = multer({
    limits: {
        fileSize: 1000000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/restaurants/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    req.restaurant.avatar = buffer
    await req.restaurant.save()
  res.json({
    msg: "profile picture updated successfully!!",
    restaurant: req.restaurant,
    token: req.restaurant.token,
    expiresIn: 3600
  })
}, (error, req, res, next) => {
    res.status(400).json({ error: error.message })
})

router.delete('/restaurants/me/avatar', auth, async (req, res) => {
  req.restaurant.avatar = undefined
  await req.restaurant.save()
  res.json({
    restaurant: req.restaurant
  })
})

router.get('/restaurants/:id/avatar', async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
  
    if (restaurant) {
        restaurant = restaurant
    } 

    try {
        
        if (!restaurant.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(restaurant.avatar)

    } catch (e) {
        res.status(404).send()
    }
})

//-------------Cover photo-------------------------------------------------

router.post('/restaurants/me/coverphoto', auth, upload.single('coverphoto'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).png().toBuffer()
  req.restaurant.coverphoto = buffer
  await req.restaurant.save()
res.json({
  msg: "cover picture updated successfully!!",
  restaurant: req.restaurant,
  token: req.restaurant.token,
  expiresIn: 3600
})
}, (error, req, res, next) => {
  res.status(400).json({ error: error.message })
})

router.delete('/restaurants/me/coverphoto', auth, async (req, res) => {
req.restaurant.coverphoto = undefined
await req.restaurant.save()
res.json({
  restaurant: req.restaurant
})
})

router.get('/restaurants/:id/coverphoto', async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
  
  try {
      
      if (!restaurant.coverphoto) {
          throw new Error()
      }

      res.set('Content-Type', 'image/png')
      res.send(restaurant.coverphoto)

  } catch (e) {
      res.status(404).send()
  }
})

module.exports = router
