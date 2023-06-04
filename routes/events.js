const express = require("express")
const isLoggedIn = require("../middleware/isLoggedIn")

const router = express.Router()

router.use(isLoggedIn)

// 2. Collect EventDetails {on admin Side}
// Will contains participants / attendance for each event !!
// this will Ngo them create an event !!
// and post it's attendance !! and progress !!
router.post("/", async (req, res) => {
  let participants = req.body.participants // array of userObjects !!
  let feedbacks = req.body.feedbacks // array of objects !!
  let sessionId = req.body.sessionId
  let category = req.body.category
  const attendance = []
  const feedback = []
  try {
    await Promise.all(
      participants.map(async (participant) => {
        const result = await User.find({
          "basicDetails.Name": participant.name,
        })
        if (result.length > 0) {
          //   console.log(result[0]);
          attendance.push(result[0])
        }
      })
    )

    await Promise.all(
      feedbacks.map(async (feedBack) => {
        console.log(feedBack.user.name)
        const result = await User.find({
          "basicDetails.Name": feedBack.user.name,
        })
        if (result.length > 0) {
          // console.log(result[0]);
          feedback.push({
            user: result[0],
            content: feedBack.content,
          })
        }
      })
    )

    const currentEvent = new Event({
      sessionId,
      category,
      participants: attendance,
      feedback,
    })

    Event.insertMany([currentEvent], function (err) {
      if (err) {
        res.status(500).json({ message: err.message })
      } else {
        res.status(200).json({ message: "Success" })
      }
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// data retrival routes { all admin side }

// getting attendance based on sessionId !!
router.get("/attendance/:id", async (req, res) => {
  try {
    let sessionId = req.params.id // accessing the request parameters !!
    const result = await Event.find({ sessionId: sessionId })

    if (result.length > 0) {
      res.status(200).json({ result: result[0].participants })
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
