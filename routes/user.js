const express = require("express")
const isLoggedIn = require("../middleware/isLoggedIn")

const router = express.Router()

router.use(isLoggedIn)
// userDataCollectionRoutes !!

// 1. Collect userDetails { for now on adminSide }
router.post("/", (req, res) => {
  const Name = req.body.name
  const Age = req.body.age
  const Dob = req.body.dob
  const PhoneNumber = req.body.phoneNumber
  const Address = req.body.address
  const Community = req.body.community
  const PrimaryLanguage = req.body.primaryLanguage
  const NumOfChild = req.body.numOfChild
  const MaritalStatus = req.body.maritalStatus
  const Income = req.body.income
  const currentEducationLevel = req.body.currentEducationLevel
  const literacyStatus = req.body.literacyStatus
  const furtherStudyInterest = req.body.furtherStudyInterest
  const currentEmployment = req.body.currentEmployment
  const prevEmployment = req.body.prevEmployment
  const jobTraining = req.body.jobTraining
  const hospitalizationRecords = req.body.hospitalizationRecords
  const prescripton = req.body.prescripton
  const bloodGroup = req.body.bloodGroup
  const Allergies = req.body.allergies
  const healthInsurance = req.body.healthInsurance
  const rationCard = req.body.rationCard
  const aadharCard = req.body.aadharCard
  const esharamCard = req.body.esharamCard
  const panCard = req.body.panCard
  const voterId = req.body.voterId

  const currentUser = new User({
    basicDetails: {
      Name,
      Age,
      Dob,
      PhoneNumber,
      Address,
      Community,
      FamilyDetails: {
        NumOfChild,
        MaritalStatus,
        Income,
      },
      PrimaryLanguage,
    },
    educationStatus: {
      currentEducationLevel,
      literacyStatus,
      furtherStudyInterest,
    },
    employmentStatus: {
      currentEmployment,
      prevEmployment,
      jobTraining,
    },
    medicalRecords: {
      hospitalizationRecords,
      prescripton,
      bloodGroup,
      Allergies,
      healthInsurance,
    },
    govtSchemes: {
      rationCard,
      aadharCard,
      esharamCard,
      panCard,
      voterId,
    },
  })

  User.insertMany([currentUser], function (err) {
    if (err) {
      res.status(500).json({ message: err.message })
    } else {
      res.status(200).json({ message: "Success !!" })
    }
  })
})

// get userList based on Community { For Community management tool }
router.get("/:community", async (req, res) => {
  try {
    const community = req.params.community
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

// get all users list !!
router.get("/", async (req, res) => {
  try {
    const result = await User.find({})
    if (result.length > 0) {
      res.status(200).json({ result: result })
    } else {
      res.status(200).json({ result: [] })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// update user's info !!
router.put("/update/:name", async (req, res) => {
  try {
    const name = req.params.name
    const updatedData = req.body

    const updatedUser = await User.findOneAndUpdate(
      { "basicDetails.Name": name },
      updatedData,
      { new: true }
    )
    if (!updatedUser) {
      res.status(404).json({ error: "User not found" })
    } else {
      res.status(200).json(updatedUser)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// search user by name !!
router.get("/search/:name", async (req, res) => {
  try {
    const name = req.params.name
    const result = await User.find({ "basicDetails.Name": name })
    if (result.length > 0) {
      res.status(200).json({ result: result[0] })
    } else {
      res.status(401).json({ message: "User Not Found !!" })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// get users categorized by education levels { For data visualization }
router.get("/education", async (req, res) => {
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

  return processDataForChart3(educationGroups)
}

const processDataForChart3 = (educationGroups) => {
  const labels = Object.keys(educationGroups)
  const data = Object.values(educationGroups).map(
    (usersArray) => usersArray.length
  )

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

// Data visualization Routes :

// ofcourse on admin side
// get users categorized by age { for data visualization }
router.get("/age", async (req, res) => {
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
    const age = user.basicDetails.Age

    // Check if the age group exists, if not create it
    if (!ageGroups[age]) {
      ageGroups[age] = []
    }

    // Add the user to the respective age group
    ageGroups[age].push(user)
  })

  // console.log(ageGroups);

  return processDataForChart(ageGroups)
}

const processDataForChart = (ageGroups) => {
  const labels = Object.keys(ageGroups)
  const data = Object.values(ageGroups).map((usersArray) => usersArray.length)

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

router.get("/community", async (req, res) => {
  try {
    const users = await User.find()
    if (users.length > 0) {
      // console.log(users);
      const result = processData2(users)
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

  // Categorize users by age
  users.forEach((user) => {
    const community = user.basicDetails.Community

    // Check if the age group exists, if not create it
    if (!communityGroups[community]) {
      communityGroups[community] = []
    }

    // Add the user to the respective age group
    communityGroups[community].push(user)
  })

  // console.log(ageGroups);

  return processDataForChart2(communityGroups)
}

const processDataForChart2 = (communityGroups) => {
  const labels = Object.keys(communityGroups)
  const data = Object.values(communityGroups).map(
    (usersArray) => usersArray.length
  )

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
