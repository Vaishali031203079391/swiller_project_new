const jwt = require('jsonwebtoken')
const User = require('../models/restaurant')
//const Student = require('../models/student')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const restaurant = await User.findOne({ _id: decoded._id, 'tokens.token': token })

      if(!restaurant){
        throw new Error()
      } else{
        req.token = token
        req.restaurant = restaurant
        next()
      }
 
    } catch (e) {
        res.status(401).json({ msg: 'Please authenticate.' })
    }
}

module.exports = auth
