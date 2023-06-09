//jshint esversion:6
require("dotenv").config()
const express = require("express")
const router = express.Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const authorizeUser = require("../middleware/userAuth")
const authorizeAdmin = require("../middleware/adminAuth")
const Event = require("../models/events")
const { v4: uuidv4 } = require("uuid")
const webPush = require("web-push")

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// use same as registeration done by the userItself !! it is that route

// router.post("/register/admin", (req, res) => {
//   try{
//     const {
//       pwd,
//       basicDetails: {
//         name,
//         age,
//         gender,
//         PhoneNumber,
//         address: { address1, state, city, zip },
//         Community,
//         familyDetails: { numOfChild, maritalStatus, income, dependents },
//         primaryLanguage
//       },
//       educationStatus: { currentEducationLevel, ongoingEducation, furtherStudyInterest },
//       employmentStatus: { currentEmployment, workNature, workIndustry, prevEmployment, openForEmployment },
//       SocioeconomicStatus: { cleanWaterAccess, electricityAccess, housingType, transportationAccess },
//       medicalRecords: { hospitalizationRecords, chronicIllnesses, currentMedications, bloodGroup, allergies, vaccinationRecords, healthInsurance },
//       govtSchemes: { rationCard, aadharCard, esharamCard, panCard, voterId }
//     } = req.body;

//     const _id = uuidv4();

//     const saltRounds = 10;
//         bcrypt.hash(pwd, saltRounds, function(err, hash){
//                   const currentUser =new User({
//               pwd:hash,
//               role:"Admin",
//               _id,
//               basicDetails: {
//                 name,
//                 age,
//                 gender,
//                 PhoneNumber,
//                 address: {
//                   address1,
//                   state,
//                   city,
//                   zip
//                 },
//                 Community,
//                 familyDetails: {
//                   numOfChild,
//                   maritalStatus,
//                   income,
//                   dependents
//                 },
//                 primaryLanguage
//               },
//               educationStatus: {
//                 currentEducationLevel,
//                 ongoingEducation,
//                 furtherStudyInterest
//               },
//               employmentStatus: {
//                 currentEmployment,
//                 workNature,
//                 workIndustry,
//                 prevEmployment,
//                 openForEmployment
//               },
//               SocioeconomicStatus: {
//                 cleanWaterAccess,
//                 electricityAccess,
//                 housingType,
//                 transportationAccess
//               },
//               medicalRecords: {
//                 hospitalizationRecords,
//                 chronicIllnesses,
//                 currentMedications,
//                 bloodGroup,
//                 allergies,
//                 vaccinationRecords,
//                 healthInsurance
//               },
//               govtSchemes: {
//                 rationCard,
//                 aadharCard,
//                 esharamCard,
//                 panCard,
//                 voterId
//               }
//             });

//             User.insertMany([currentUser], function (err) {
//               if (err) {
//                 res.status(500).json({ message: err.message })
//               } else {
//                 const user={_id:_id,role:"Admin"};
//                 const accessToken=jwt.sign(user,process.env.SECRET_KEY);
//                 res.status(200).json({accessToken:accessToken});
//               }
//             })

//         });
//   }
//   catch(err){
//     console.error(error);
//     res.status(500).json({ message: 'Error occurred while saving data.' });
//   }
// })

const saltRounds = 10

// registeration done by the userItself !! it is that route

router.post("/register/admin", (req, res) => {
  console.log(req.body)
  const { name, password, number } = req.body

  if (!name || !password || !number) {
    return res.status(400).json({ message: "Basic details are required." })
  }

  const _id = uuidv4()
  bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
      return res.status(500).json({ message: err.message })
    } else {
      const currentUser = new User({
        role: "Admin",
        pwd: hash,
        _id,
        basicDetails: {
          name,
          PhoneNumber: number,
        },
      })

      User.insertMany([currentUser], function (err) {
        if (err) {
          return res.status(500).json({ message: err.message })
        } else {
          const user = {
            _id: currentUser._id,
            role: "Admin",
            name: currentUser.basicDetails.name,
          }
          const accessToken = jwt.sign(user, process.env.SECRET_KEY)
          return res.status(200).json({ ...user, accessToken })
        }
      })
    }
  })
})
router.post("/register/byUser", (req, res) => {
  const { pwd, basicDetails, ...rest } = req.body

  if (!basicDetails) {
    return res.status(400).json({ message: "Basic details are required." })
  }

  const { PhoneNumber, name, gender, Community } = basicDetails

  if (!pwd || !PhoneNumber || !name || !gender || !Community) {
    return res.status(400).json({
      message:
        "Password, phone number, name, gender, and community are required.",
    })
  }

  const _id = uuidv4()

  bcrypt.hash(pwd, saltRounds, function (err, hash) {
    if (err) {
      return res.status(500).json({ message: err.message })
    } else {
      const tempCom = Community.toUpperCase()

      const currentUser = new User({
        role: "User",
        pwd: hash,
        role: "User",
        _id,
        basicDetails: {
          PhoneNumber,
          name,
          gender,
          Community: tempCom,
          ...basicDetails,
        },
        ...rest,
      })

      User.insertMany([currentUser], function (err) {
        if (err) {
          if (err.code === 11000) {
            return res
              .status(500)
              .json({ message: "Phone number already exists." })
          } else {
            return res.status(500).json({ message: err.message })
          }
        } else {
          const user = {
            _id: currentUser._id,
            role: "User",
            name: currentUser.basicDetails.name,
          }
          const accessToken = jwt.sign(user, process.env.SECRET_KEY)
          return res.status(200).json({ ...user, accessToken })
        }
      })
    }
  })
})

// registeration done by admin !! it is that route    , or just use the user registeration route and change the role to admin??
router.post("/register/byAdmin", authorizeAdmin, (req, res) => {
  const { pwd, basicDetails, ...rest } = req.body

  if (!basicDetails) {
    return res.status(400).json({ message: "Basic details are required." })
  }

  const { PhoneNumber, name, gender, Community } = basicDetails
  if (!pwd || !PhoneNumber || !name || !gender || !Community) {
    return res.status(400).json({
      message:
        "Password, phone number, name, gender, and community are required.",
    })
  }
  const saltRounds = 10
  const _id = uuidv4()

  bcrypt.hash(pwd, saltRounds, function (err, hash) {
    if (err) {
      return res.status(500).json({ message: err.message })
    } else {
      const tempCom = Community.toUpperCase()
      const currentUser = new User({
        pwd: hash,
        role: "User",
        _id,
        basicDetails: {
          PhoneNumber,
          name,
          gender,
          Community: tempCom,
          ...basicDetails,
        },
        ...rest,
      })

      User.insertMany([currentUser], function (err) {
        if (err) {
          return res.status(500).json({ message: err.message })
        } else {
          return res.status(200).json({ message: "Success" })
        }
      })
    }
  })
})

// login route !!
// Sign in by Phone Number and Password
router.post("/login", async (req, res) => {
  const { PhoneNumber, pwd } = req.body
  console.log(PhoneNumber, pwd)
  try {
    const results = await User.find({ "basicDetails.PhoneNumber": PhoneNumber })

    if (results.length === 0) {
      return res.status(500).json({ message: "NO ENTRY FOUND !!!" })
    }

    let userFound = false

    for (const result of results) {
      const storedHashedPassword = result.pwd
      const passwordMatch = await bcrypt.compare(pwd, storedHashedPassword)

      if (passwordMatch) {
        const user = {
          _id: result._id,
          role: result.role,
          name: result.basicDetails.name,
        }
        const accessToken = jwt.sign(user, process.env.SECRET_KEY)
        return res.status(200).json({ accessToken, ...user })
      }
    }

    res.status(500).json({ message: "INVALID CREDENTIALS !!!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/addCommunity", async (req, res) => {
  const { Community } = req.body

  try {
    // Check if community already exists
    const existingCommunity = await User.findOne({
      "basicDetails.Community": Community.toUpperCase(),
    })

    if (existingCommunity) {
      return res.status(409).json({ message: "Community already exists" })
    }

    const pwd = "DoesNotExist" + uuidv4()
    const isFakeUser = true
    const tempCom = Community.toUpperCase()
    const currUser = new User({
      // Other user properties
      pwd,
      isFakeUser,
      basicDetails: {
        // Other basic details properties
        Community: tempCom,
      },
    })

    User.insertMany([currUser], function (err) {
      if (err) {
        return res.status(500).json({ message: err.message })
      } else {
        return res.status(200).json({ message: "Success" })
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// get all users list !!
router.get("/", authorizeAdmin, async (req, res) => {
  try {
    const result = await User.find({}).where({ role: { $ne: "Admin" } })
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// filter user by Community
router.get("/filter/community", authorizeAdmin, async (req, res) => {
  try {
    const community = req.body.community
    const result = await User.find({ "basicDetails.Community": community })
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// filter user by age
router.get("/filter/age", authorizeAdmin, async (req, res) => {
  try {
    const age = req.body.age
    const result = await User.find({ "basicDetails.age": age })
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// filter user by name
router.get("/filter/name", authorizeAdmin, async (req, res) => {
  try {
    // const name = req.query.name;
    const name = new RegExp(`^${req.query.name}`, "i") // Case-insensitive regex to match the name prefix

    const result = await User.find({ "basicDetails.name": name })
    // UserDetails
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(401).json({ message: "User Not Found !!" })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// filter user by phoneNumber
router.get("/filter/phoneNumber", authorizeAdmin, async (req, res) => {
  try {
    const PhoneNumber = req.body.phoneNumber
    const result = await User.find({ "basicDetails.PhoneNumber": PhoneNumber })
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GROUPING :

// group by education levels
router.get("/group/education", authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData3(users)
      res.status(200).json({ result: result })
      // using the result property of the json object returned we can
      // have that object send as prop to the component of chart.js
    } else {
      res.status(200).json({ result: {} })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const processData3 = (users) => {
  const educationGroups = {}

  // Categorize users by age
  users.forEach((user) => {
    const education = user.educationStatus.currentEducationLevel

    // Check if the age group exists, if not create it
    if (!educationGroups[education]) {
      educationGroups[education] = []
    }

    // Add the user to the respective age group
    educationGroups[education].push(user)
  })

  // console.log(ageGroups);

  return educationGroups
}

// group by age
router.get("/group/age", authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData(users)
      res.status(200).json({ result: result })
      // using the result property of the json object returned we can
      // have that object send as prop to the component of chart.js
    } else {
      res.status(200).json({ result: {} })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const processData = (users) => {
  const ageGroups = {}

  // Categorize users by age
  users.forEach((user) => {
    const age = user.basicDetails.age

    // Check if the age group exists, if not create it
    if (!ageGroups[age]) {
      ageGroups[age] = []
    }

    // Add the user to the respective age group
    ageGroups[age].push(user)
  })

  // console.log(ageGroups);

  return ageGroups
}

// group by community
router.get("/group/community", async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData2(users)
      console.log(result)
      res.status(200).json({ result: result })
      // using the result property of the json object returned we can
      // have that object send as prop to the component of chart.js
    } else {
      res.status(200).json({ result: {} })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const processData2 = (users) => {
  const communityGroups = {}
  const regexPattern = /^DoesNotExist/
  // Categorize users by age
  users.forEach((user) => {
    const community = user.basicDetails.Community
    if (regexPattern.test(user.pwd)) {
      console.log("Hello")
      if (!communityGroups[community]) {
        communityGroups[community] = []
      }
    } else {
      // Check if the age group exists, if not create it
      if (!communityGroups[community]) {
        communityGroups[community] = []
      }

      // Add the user to the respective age group
      communityGroups[community].push(user)
    }
  })

  // console.log(ageGroups);

  return communityGroups
}

// group by gender
router.get("/group/gender", authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData4(users)
      res.status(200).json({ result: result })
      // using the result property of the json object returned we can
      // have that object send as prop to the component of chart.js
    } else {
      res.status(200).json({ result: {} })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const processData4 = (users) => {
  const genderGroups = {}

  // Categorize users by age
  users.forEach((user) => {
    const gender = user.basicDetails.gender

    // Check if the age group exists, if not create it
    if (!genderGroups[gender]) {
      genderGroups[gender] = []
    }

    // Add the user to the respective age group
    genderGroups[gender].push(user)
  })

  // console.log(ageGroups);

  return genderGroups
}

// user Side updating the info !! { he should be only updating it !! }
//added partial update support, coz my user update page sends data in parts and not the whole object
// diabled authentication for now: authorizeUser,  please add it later
router.put("/userUpdates/:id", async (req, res) => {
  try {
    const _id = req.params.id // Extracting userId from the route parameter

    const result = await User.findOne({ _id: _id })

    if (result) {
      let update = {}
      for (let key in req.body) {
        if (req.body[key] instanceof Object && !Array.isArray(req.body[key])) {
          for (let subKey in req.body[key]) {
            update[`${key}.${subKey}`] = req.body[key][subKey]
          }
        } else {
          update[key] = req.body[key]
        }
      }

      User.findByIdAndUpdate(
        { _id: _id },
        { $set: update },
        { new: true },
        (err, updatedUser) => {
          if (err) {
            res.status(500).json({ message: err.message })
          } else {
            res
              .status(200)
              .json({ message: "User updated successfully", user: updatedUser })
          }
        }
      )
    } else {
      res.status(500).json({ message: "No Such User Exist" })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//get user details by id  ,
router.get("/user/:id", async (req, res) => {
  try {
    const _id = req.params.id // Extracting userId from request params

    // Find user based on the id
    const user = await User.findById(_id)

    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Show All the Events in which he/she has not registered !!
router.get("/getUnregisteredEvents", authorizeUser, (req, res) => {
  const userId = req.user._id
  // getAllEvents where registered.includes(userId) is false !!
  Event.find({ registered: { $nin: [userId] } }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json({ events: events })
    }
  })
})

// Show All the Events in which he/she has registered but not attended !!
// whenever user will click on frontend side to attend the page will
// refetch this list again !!
router.get("/getRegisteredEvents", authorizeUser, (req, res) => {
  const userId = req.user._id
  // getAllEvents where registered.includes(userId) is false !!
  Event.find({
    registered: { $in: [userId] },
    attended: { $nin: [userId] },
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json({ events: events })
    }
  })
})

// get all the events in which he/she has Registred !! without authorization
router.get("/getUsersRegisteredEvents/:id", (req, res) => {
  const userId = req.params.id

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  // getAllEvents where registered.includes(userId) is false
  Event.find({
    registered: { $in: [userId] },
    attended: { $nin: [userId] },
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json(events)
    }
  })
})

// now : REGISTER , ATTEND , FOLLOW UP AND FEEDBACK AN EVENT OPTION !!
// FOR THE USER !!
// All of them will be post requests bcz we are adding a user !!
router.post("/registerForEvent", authorizeUser, async (req, res) => {
  try {
    let eventId = req.body.eventId
    const userId = req.user._id
    const event = await Event.findById(eventId)
    if (!event.registered.includes(userId)) {
      event.registered.push(userId)
      await sendNotif(userId, {
        title: "New Event Registration",
        body: `You have successfully registered for the event ${event.eventName}`,
      })
    } else {
      res
        .status(500)
        .json({ message: "User is already registered for this event." })
    }
    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/registerForEvent/byAdmin", authorizeAdmin, async (req, res) => {
  try {
    console.log("rEACTED")
    let eventId = req.body.eventId
    const userId = req.body.userId
    const event = await Event.findById(eventId)
    if (!event.registered.includes(userId)) {
      event.registered.push(userId)
    } else {
      res
        .status(500)
        .json({ message: "User is already registered for this event." })
    }
    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//register for an event (user side)
router.post("/registerForAnEvent", async (req, res) => {
  try {
    const { eventId, userId } = req.body

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found." })
    }

    if (!event.registered.includes(userId)) {
      event.registered.push(userId)
      await sendNotif(userId, {
        title: "New Event Registration",
        body: `You have successfully registered for the event ${event.eventName}`,
      })
    } else {
      return res.status(500).json({ message: "repeat" })
    }

    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/attendEvent", authorizeUser, async (req, res) => {
  try {
    let eventId = req.body.eventId
    const userId = req.user._id
    const event = await Event.findById(eventId)
    if (!event.attended.includes(userId)) {
      event.attended.push(userId)
    } else {
      res
        .status(500)
        .json({ message: "User is already registered for this event." })
    }
    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//for user side attend an event , won't affect anything
router.post("/attendAnEvent", async (req, res) => {
  try {
    const { eventId, userId } = req.body

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found." })
    }

    if (!event.attended.includes(userId)) {
      event.attended.push(userId)
    } else {
      return res
        .status(500)
        .json({ message: "User is already registered for this event." })
    }

    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

//list of all the events in which user has attended
router.get("/getUsersAttendedEvents/:id", (req, res) => {
  const userId = req.params.id

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  // getAllEvents where registered.includes(userId) and attended.includes(userId)
  Event.find({
    registered: { $in: [userId] },
    attended: { $in: [userId] },
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json(events)
    }
  })
})

router.post("/followUpForEvent", authorizeUser, async (req, res) => {
  try {
    let eventId = req.body.eventId
    const userId = req.user._id
    const event = await Event.findById(eventId)
    if (!event.followedUp.includes(userId)) {
      event.followedUp.push(userId)
    } else {
      res
        .status(500)
        .json({ message: "User is already registered for this event." })
    }
    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/feedbackForEvent", authorizeUser, async (req, res) => {
  try {
    let eventId = req.body.eventId
    let content = req.body.content
    const userId = req.user._id
    const event = await Event.findById(eventId)

    // now create a feedback
    const currentFeedback = {
      uid: userId,
      content: content,
    }
    event.feedback.push(currentFeedback)
    await event.save()
    res.status(200).json({ message: "Success !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/getFollowUpPending/:id", (req, res) => {
  const userId = req.params.id

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  // Find all events where registered.includes(userId) and attended.includes(userId) but not followedUp.includes(userId)
  Event.find({
    registered: { $in: [userId] },
    attended: { $in: [userId] },
    followedUp: { $nin: [userId] }, // $nin (not in) is used here
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json(events)
    }
  })
})

// Mark user as followed up for an event
router.post("/markUserFollowedUp", async (req, res) => {
  try {
    const { eventId, userId } = req.body

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found." })
    }

    if (!event.followedUp.includes(userId)) {
      event.followedUp.push(userId)
    } else {
      return res.status(500).json({
        message: "User is already marked as followed up for this event.",
      })
    }

    await event.save()
    res.status(200).json({ message: "Success, user marked as followed up !!" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// List of all events in which user has registered, attended and followed up
router.get("/getFollowUpDone/:id", (req, res) => {
  const userId = req.params.id

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" })
  }

  // Find all events where registered.includes(userId), attended.includes(userId) and followedUp.includes(userId)
  Event.find({
    registered: { $in: [userId] },
    attended: { $in: [userId] },
    followedUp: { $in: [userId] }, // $in (in) is used here
  }).exec((err, events) => {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json(events)
    }
  })
})

router.post("/addSub", async (req, res) => {
  const { userId, sub } = req.body
  const subExists = await User.exists({
    _id: userId,
    subs: { $elemMatch: { endpoint: sub.endpoint } },
  })

  if (subExists) return res.json({ message: "Subscription already exists" })
  User.findByIdAndUpdate(userId, { $push: { subs: sub } })
    .then(() => {
      return res.json({ success: true })
    })
    .catch((e) => {
      console.log(e)
      res.json({ success: false })
    })
})

const sendNotif = async (userId, payload) => {
  const user = await User.findOne({ _id: userId })
  console.log(user.subs)
  user.subs.map(async (sub) => {
    try {
      await webPush.sendNotification(sub, JSON.stringify(payload))
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        await User.findByIdAndUpdate(userId, {
          $pull: { subs: { _id: sub._id } },
        })
      }
    }
  })
}

module.exports = router
