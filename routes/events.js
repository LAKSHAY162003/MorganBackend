const express = require("express")
const Event=require("../models/events");
const router = express.Router()
const authorizeUser=require("../middleware/userAuth");
const authorizeAdmin=require("../middleware/adminAuth");

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
router.post("/createEvent",async (req,res)=>{

  const details=req.body; // we will have 
  // sessionId , eventName,eventCategory , location in body !!

    const currentEvent=new Event({
          sessionId:details.sessionId,
          category:details.eventCategory,
          location:details.location,
          eventName:details.eventName,
          attended:[],
          followedUp:[],
          registered:[],
          feedback:[]
    });

    Event.insertMany([currentEvent], function (err) {
      if (err) {
        res.status(500).json({message:err.message});
      } else {
        res.status(200).json({ message: "Success"});
      }
    });


});

router.post("/markAttendance/:sessionId",async (req,res)=>{
      try{
            const objectId=req.body.objectId;
            const currEvent=await Event.find({sessionId:sessionId});
            // now currEvent.attended.push(objectId of this user !! );
            if(currEvent.length>0){
                const attendedArray=currEvent[0].attended;
                attendedArray.push(objectId);
                res.status(200).json({message:"success"});
            }
            else{
                res.status(401).json({result:"No Such Event Exist"});
            }
      }
      catch(err){
          res.status(500).json({message:err.message});
      }
});


// data retrival routes { all admin side }

// get all events
// to get all events !! 

router.get("/",async (req,res)=>{
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
router.get("/attendance/:id", async (req, res) => {
  try {
    let sessionId = req.params.id // accessing the request parameters !!
    const result = await Event.find({ sessionId: sessionId })

    if (result.length > 0) {
      // SEE ATTENDED KO CHANGE KARO !! 
      res.status(200).json({ result: result[0].attended})
    } else if (result.length == 0) {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// get user feedbacks based on sessions
router.get("/feedbacks/:id", async (req, res) => {
  try {
    const sessionId = req.params.id

    const result = await Event.find({ sessionId: sessionId })
    if (result.length > 0) {
      res.status(200).json({ result: result[0].feedback })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// get attendance count categorized based on session !!
router.get("/attendance", async (req, res) => {
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
// value : attendance Count !!
const processData4 = (events) => {
  const attendancePerSession = {}

  events.forEach((event) => {
    const sessionId = event.sessionId
    const participants = event.participants
    if (!attendancePerSession[sessionId]) {
      attendancePerSession[sessionId] = participants.length
    }
  })

  // console.log(ageGroups);

  return processDataForChart4(attendancePerSession)
}

const processDataForChart4 = (attendancePerSession) => {
  const labels = Object.keys(attendancePerSession)
  const data = Object.values(attendancePerSession)

  return {
    labels,
    datasets: [
      {
        label: "User Count",
        data,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  }
}

module.exports = router
