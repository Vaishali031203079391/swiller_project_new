const express = require('express')
const Offer = require('../models/offers')
//const User = require('../models/restaurant')
const Restaurant = require('../models/restaurant')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

//-------------------------TASK ROUTER FOR INSTRUCTORS----------------------------------------------

// 1) ADDING TASK-

const upload = multer({

  limits: {
    fileSize: 100000000
  },
  fileFilter(req, file, cb) {
    //if (!file) {
    //  return
    //}

    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
  }
})

router.post('/offers', auth, async (req, res) => {
  //const buffer = await sharp(req.file.buffer).png().toBuffer()
  const offer = new Offer({
    ...req.body,
    //avatar: buffer,
    owner: req.restaurant._id
  })

  console.log(offer);
  try {
    await offer.save()
    res.status(201).json({
      msg: 'Offer Posted Successfully',
      offer: offer,
      restaurant: req.restaurant
    })
  } catch (e) {
    res.status(400).json({
      error: e
    })
  }
})

/* router.post('/offers', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    const offer = new Offer({
      ...req.body,
      avatar: buffer,
      owner: req.user._id
    })

    try {
      await offer.save()
      res.status(201).json({
        offer: offer,
        restaurant: req.user
      })
    } catch (e) {
      res.status(400).json({
        error: e
      })
    }
}) */

// 2) ONLY TASKS CREATED BY INSTRUCTORS-


// GET /tasks?completed=true
// GET /tasks?pageSize=${coursesPerPage}&currentPage=${currentPage}
// GET /tasks?sortBy=createdAt:desc or asc
router.get('/restaurant-offers', auth, async (req, res) => {

  const sort = {}

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {

    await req.user.populate({
      path: 'offers',
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.limit * (req.query.skip - 1)),
        sort
      }
    }).execPopulate()

    restaurantOffers = await Offer.find()
    let length = restaurantOffers.length

    //console.log(length)

    res.json({
      owner: req.user.name,
      offers: req.user.offers,
      offersCount: length
    })
  } catch (e) {
    res.status(500).json({
      error: e
    })
  }
})

router.get('/offers/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const offer = await Offer.findOne({ _id, owner: req.user._id })

        if (!offer) {
          return res.status(404).json({
            error: "Not Found"
          })
        }

      res.status(200).json({
        offer: offer,
        owner: req.user.name
      })
    } catch (e) {
      res.status(500).json({
        error : e
      })
    }
})


// 3) UPDATE TASK

router.put('/offers/:id', auth, upload.single('avatar'), async (req, res) => {

  //var buffer = null
  //if (req.file) {
  //  upload.single('avatar')
  //  buffer = await sharp(req.file.buffer).png().toBuffer()
  //}

  //if (req.file.buffer) {
  //  buffer = await sharp(req.file.buffer).png().toBuffer()
  //}

    
  //console.log(req.body);
    const buffer = await sharp(req.file.buffer).png().toBuffer()
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'avatar']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' })
    }

    try {
      const offer = await Offer.findOne({ _id: req.params.id, owner: req.user._id })
      //console.log(task)

        if (!offer) {
          return res.status(404).json({
            error: "Not Found!"
          })
        }

      updates.forEach((update) => offer[update] = req.body[update])

      if (buffer) {
        offer.avatar = buffer
      }
      
      savedOffer = await offer.save()
      //console.log(task)
      return res.status(200).json({
        msg: "updated Successfully",
        offer: savedOffer,
        id: offer._id
      })
    } catch (e) {
      res.status(400).json({
        error: e
      })
    }
})

//----------------------TASKS ROUTERS FOR STUDENTS---------------------------------------------------

// 1) GET TASKS

/* router.get('/alloffers', async (req, res) => {
    var mysort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        mysort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    var limit = parseInt(req.query.limit)
    var skip = parseInt(req.query.limit * (req.query.skip - 1))

    try {
      const offers = await Offer.find({}).sort(mysort).skip(skip).limit(limit)
      allOffers = await Offer.find({})
      let length = allOffers.length

      res.status(200).json({
        offers: offers,
        offersCount: length
      })
    } catch (e) {
      return res.status(500).json({
        error: "error"
      })
    }
}) */

// 3) GET TASKS - MYTASKS AND VIEW

/* router.get('/alloffers/get/:id', async (req, res) => {
  const _id = req.params.id

  try {
    const offer = await Offer.findOne({ _id })

    if (!offer) {
      return res.status(404).send()
    }

    const owner = await Offer.findOne({ _id: offer.owner})
    res.status(200).json({
      offer: offer,
      owner: owner.name
    })
  } catch (e) {
    res.status(500).send()
  }
}) */

// 2) SUBSCRIBE TASKS

/* router.patch('/offers/buy/:id', auth, async (req, res) => {    
  try {

        const id = req.user._id
        const offer = await Offer.findOne({ _id: req.params.id })
        //const user = await Student.findOne({ _id: id })
      //console.log(user)
      //console.log(task)
        const offer_id = offer.id
        
        if (!offer) {
            return res.status(404).send()
        }

        await offer.save()
        //await user.save()
        const buyer = await offer.addBuyer(id)
        if (buyer) {
          const adOffer = await user.addOffer(task_id)
          //console.log(buyer)
          //console.log(adTask)
          res.status(201).json({
            offer: offer,
            user: user,
            adOffer: adOffer,
            msg: "Enrolled for the Course"
          })
        } else {
          res.status(500).json({
            msg: 'Already enrolled'
          })
        }
  
        
    } catch (e) {
      res.status(400).json({
        error: e
      })
    }
}) */

// 3) GET TASKS - MYTASKS AND VIEW

router.get('/mytasks/get/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const offer = await Offer.findOne({ _id })

        if (!offer) {
          return res.status(404).json({
            error: "No such Course"
          })
        }

      const owner = await Restaurant.findOne({ _id: offer.owner })
      res.json({
        offer: offer,
        owner: owner.name
      })
    } catch (e) {
      res.status(500).json({
        error: e
      })
    }
})

// 4) GET TASKS ONLY SUBSCRIBED TASKS-

/* router.get('/mytasks', auth, async (req, res) => {

  var per_page = parseInt(req.query.limit) || 10
  var page = parseInt(req.query.skip) || 1
  offset = (page - 1) * per_page

    myTasks = []
    try {
        tasks = req.user.tasks
        for (t of tasks) {
            const _id = t.task
            mytask = await Task.findById(_id)
            myTasks.push(mytask)
      }

      myTasks.reverse()
      
      let length = myTasks.length
      modifiedMyTasks = myTasks.slice(offset).slice(0, req.query.limit)
      
      res.json({
        length: modifiedMyTasks.length,
        buyerTotalCourses: length,
        buyerTasks: modifiedMyTasks
      })
    } catch (e) {
        res.status(500).send()
    }
}) */


//-----------------------------------ASSIGNEMNT UPLOAD ROUTES-------------------------------------------------------



//const uploadDoc = multer({
//    limits: {
//        fileSize: 5000000
//    },
//    fileFilter(req, file, cb) {
//        if (!file.originalname.match(/\.(doc|docx|pdf|xls|csv)$/)) {
//            return cb(new Error('Please upload a word/excel/pdf file only!!'))
//        }

//        cb(undefined, true)
//    }
//})

router.post('/tasks/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  const task = await Task.findById(req.params.id)
  const buffer = await sharp(req.file.buffer).png().toBuffer()
    //const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    task.avatar = buffer
    await task.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.post('/tasks/:id/taskimage', auth, upload.single('taskimage'), async (req, res) => {
  const task = await Task.findById(req.params.id)
  const buffer = await sharp(req.file.buffer).png().toBuffer()
  //const buffer = await sharp(req.file.buffer).resize({ width: 350, height: 250 }).png().toBuffer()
  task.taskimage = buffer
  await task.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.msg })
})

//router.post('/tasks/:id/notes', auth, uploadDoc.single('tasknotes'), async (req, res) => {
//    const task = await Task.findById(req.params.id)
//    const buffer = Buffer.from(req.file, 'Base64')
//    task.tasknotes = buffer
//    await task.save()
//    res.send()
//}, (error, req, res, next) => {
//    res.status(400).send({ error: error.message })
//})

router.get('/tasks/:id/taskimage', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)

        if (!task || !task.taskimage) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(task.taskimage)
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/tasks/:id/avatar', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)

        if (!task || !task.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
      res.json({
        img: task.avatar
      })
    } catch (e) {
        res.status(404).send()
    }
})

//router.get('/tasks/:id/notes', async (req, res) => {
//    try {
//        const task = await Task.findById(req.params.id)

//        if (!task || !task.tasknotes) {
//            throw new Error()
//        }

        
//        res.set('Content-Type', '/png')
//        res.send(task.taskimage)
//    } catch (e) {
//        res.status(404).send()
//    }
//})

module.exports = router
