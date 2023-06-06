const express = require("express")
const Event=require("../models/events");
const router = express.Router()
const authorizeUser=require("../middleware/userAuth");
const authorizeAdmin=require("../middleware/adminAuth");
const { v4: uuidv4 } = require('uuid');
const User=require("../models/User");


// 2. Collect EventDetails {on admin Side}
// Will contains participants / attendance for each event !!
// this will Ngo them create an event !!
// and post it's attendance !! and progress !!
// router.post("/", async (req, res) => {
//   let participants = req.body.participants // array of userObjects !!
//   let feedbacks = req.body.feedbacks // array of objects !!
//   let sessionId = req.body.sessionId
//   let category = req.body.category
//   const attendance = []
//   const feedback = []
//   try {
//     await Promise.all(
//       participants.map(async (participant) => {
//         const result = await User.find({
//           "basicDetails.Name": participant.name,
//         })
//         if (result.length > 0) {
//           //   console.log(result[0]);
//           attendance.push(result[0])
//         }
//       })
//     )

//     await Promise.all(
//       feedbacks.map(async (feedBack) => {
//         console.log(feedBack.user.name)
//         const result = await User.find({
//           "basicDetails.Name": feedBack.user.name,
//         })
//         if (result.length > 0) {
//           // console.log(result[0]);
//           feedback.push({
//             user: result[0],
//             content: feedBack.content,
//           })
//         }
//       })
//     )

//     const currentEvent = new Event({
//       sessionId,
//       category,
//       attended: attendance,
//       feedback,
//       eventName,
//     })

//     Event.insertMany([currentEvent], function (err) {
//       if (err) {
//         res.status(500).json({ message: err.message })
//       } else {
//         res.status(200).json({ message: "Success" })
//       }
//     })
//   } catch (err) {
//     res.status(500).send({ message: err.message })
//   }
// })


// create new Event { without any attendance and all !! }
router.post("/createEvent",authorizeAdmin,async (req,res)=>{

  const details=req.body; 
    const _id=uuidv4(); // auto generate !! 
    const currentEvent=new Event({
          _id,
          category:details.eventCategory,
          location:details.location,
          eventName:details.eventName,
          eventStartTime:new Date(),
          eventDuration:details.eventDuration,
          eventDetails:details.eventDetails
    });

    Event.insertMany([currentEvent], function (err) {
      if (err) {
        res.status(500).json({message:err.message});
      } else {
        res.status(200).json({ message: "Success"});
      }
    });


});

// mark Attendance from admin Side !! 
router.post("/markAttendance",authorizeAdmin,async (req,res)=>{
      try{
            let eventId=req.body.eventId;
            const userId=req.body.userId;

            const event = await Event.findById(eventId);
            if (!event.attended.includes(userId)) {
              event.attended.push(userId);
            } else {
              res.status(500).json({message:'User is already registered for this event.'});
            }
            await event.save();
            res.status(200).json({message:"Success !!"});
      }
      catch(err){
          res.status(500).json({message:err.message});
      }
});


// data retrival routes { all admin side }

// get all events
// to get all events !! 
router.get("/",authorizeAdmin,async (req,res)=>{
  try{
    const result=await Event.find();
    if(result.length>0){
      res.status(200).json({result:result});
    }
    else{
      res.status(200).json({result:[]});
    }
  }
  catch(err){
    res.status(500).json({message:err.message});
  }
})


// getting attendance based on sessionId !!
router.get("/attendance",authorizeAdmin, async (req, res) => {
  try {
    let eventId = req.body.eventId // accessing the request parameters !!

    Event.findById(eventId) // Replace `eventId` with the actual event ID
  .exec(async (err, result) => {
    if (err) {
      res.status(500).json({ message: err.message });
    } else {
      const idList = result.attended;

      // Fetch user details for each ID in `idList`
      try {
        const attendanceList = await User.find({ _id: { $in: idList } });

        res.status(200).json({ result: attendanceList });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  });

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// getting registerList based on sessionId
router.get("/registeredList",authorizeAdmin, async (req, res) => {
  try {
    let eventId = req.body.eventId // accessing the request parameters !!

    Event.findById(eventId) // Replace `eventId` with the actual event ID
  .exec(async (err, result) => {
    if (err) {
      res.status(500).json({ message: err.message });
    } else {
      const idList = result.registered;

      // Fetch user details for each ID in `idList`
      try {
        const registerList = await User.find({ _id: { $in: idList } });

        res.status(200).json({ result: registerList });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  });

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})



// get user feedbacks based on sessions
router.get("/feedbacks",authorizeAdmin,async (req, res) => {
  try {
    const eventId = req.body.eventId
    const result = await Event.find({ _id: eventId })
    if (result.length > 0) {
      res.status(200).json({ result: result[0].feedback })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// group sessions based on sessionIds and display there 
// attendance , register and followed up count !!
router.get("/group/attendance",authorizeAdmin, async (req, res) => {
  try {
    const events = await Event.find()
    if (events.length > 0) {
      // console.log(users);
      const result = processData4(events)
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

// key : sessionId
// value : eventSummary !!
function processData4(events) {
  const result = {};

  // Iterate over each event
  events.forEach((event) => {
    const eventId = event._id;
    const eventName = event.eventName;
    const attendedCount = event.attended.length;
    const registeredCount = event.registered.length;
    const followedUpCount = event.followedUp.length;

    // Create an object with the desired values
    const eventSummary = {
      eventName,
      attendedCount,
      registeredCount,
      followedUpCount,
    };

    // Add the eventSummary object to the result using sessionId as the key
    result[eventId] = eventSummary;
  });

  return result;
}


module.exports = router
