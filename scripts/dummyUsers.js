const db = require("../db")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const fs = require("fs")
const crypto = require("crypto")

require("dotenv").config()

const firstNames = fs
  .readFileSync("./scripts/firstnames.txt")
  .toString()
  .trim()
  .split("\n")
const lastNames = fs
  .readFileSync("./scripts/lastnames.txt")
  .toString()
  .trim()
  .split("\n")

const randomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const randomElementRatio = (...arr) => {
  const expandedArr = arr
    .map(([elem, freq]) => Array(freq ?? 1).fill(elem))
    .flat()
  return randomElement(expandedArr)
}

const randomString = (length = 8, space = "qwertyuopasdfghjklzxcvbnm") => {
  return Array(length)
    .fill()
    .map(() => randomElement(space))
    .join("")
}

const createUser = () => {
  return {
    _id: crypto.randomUUID(),
    pwd: `$2a$10$${randomString(
      53,
      "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm01234567890+/"
    )}`,
    role: "User",
    basicDetails: {
      name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      age: Math.floor(Math.random() * 100),
      gender: randomElement(["Male", "Female", "Other"]),
      PhoneNumber: randomString(10, "1234567890"),
      address: {
        address1: "Home",
        state: "Haryana",
        city: "Gurgaon",
        zip: "122018",
      },
      Community: randomElement([
        "Maratha",
        "Brahmin",
        "Kunbi",
        "Dhangar",
        "Chambhar",
        "Mahadev Koli",
        "Mali",
        "Agri",
        "Bhandari",
        "Vanjari",
        "Teli",
        "Leva Patil",
        "Matang",
        "Nhavi",
        "Lingayat",
      ]),
      familyDetails: {
        numOfChild: Math.floor(Math.random() * 3),
        maritalStatus: randomElement(["Single", "Married", "Widowed"]),
        income: 1000 * (Math.random() * 14 + 1),
        dependents: Math.floor(Math.random() * 6),
      },
      primaryLanguage: randomElementRatio(
        ["Marathi", 5],
        ["Hindi", 3],
        ["English", 1],
        [("Other", 3)]
      ),
    },
    educationStatus: {
      currentEducationLevel: randomElementRatio(
        ["No Education", 5],
        ["Primary School", 3],
        ["Middle School", 2],
        ["10th", 1],
        ["12th", 2],
        ["Diploma", 1],
        ["Graduate", 1]
      ),
      ongoingEducation: randomElementRatio(["No", 3], ["Yes", 2]),
    },
    medicalRecords: {
      bloodGroup: randomElement([
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ]),
      allergies: randomElement(["Yes", "No"]),
      healthInsurance: randomElement(["Yes", "No"]),
      chronicIllnesses: randomElementRatio(
        ["Diabetes", 5],
        ["Cancer", 1],
        ["Arthritis", 5],
        ["Stroke", 3],
        ["Asthma", 4]
      ),
    },
    SocioeconomicStatus: {
      cleanWaterAccess:
        randomElementRatio(["Yes", 1], ["No", 2]) === "Yes" ? "Yes" : undefined,
      electricityAccess:
        randomElementRatio(["Yes", 2], ["No", 3]) === "Yes" ? "Yes" : undefined,
      transportationAccess:
        randomElementRatio(["Yes", 1], ["No", 2]) === "Yes" ? "Yes" : undefined,
      housingType: randomElement(["Kutcha", "Semi-Pucca", "Pucca"]),
    },
    govtSchemes: {
      rationCard:
        randomElementRatio(["Yes", 1], ["No", 2]) === "Yes" ? "Yes" : undefined,
      aadharCard:
        randomElementRatio(["Yes", 1], ["No", 2]) === "Yes" ? "Yes" : undefined,
      esharamCard:
        randomElementRatio(["Yes", 1], ["No", 2]) === "Yes" ? "Yes" : undefined,
      panCard:
        randomElementRatio(["Yes", 1], ["No", 2]) === "Yes" ? "Yes" : undefined,
      voterId:
        randomElementRatio(["Yes", 1], ["No", 2]) === "Yes" ? "Yes" : undefined,
    },
    location: {
      type: "Point",
      coordinates: randomElementRatio(
        [[72.8831, 19.151], 3],
        [[74.124, 15.2993], 2],
        [[73.8567, 18.5204], 2],
        [[72.8781, 19.0708], 2],
        [[75.7139, 15.3173], 1],
        [[77.5729, 12.9851], 1]
      ).map((coord) => coord + (Math.random() - 0.5) * 0.1),
    },
    employmentStatus: {
      currentEmployment: randomElementRatio(
        ["Unemployed", 5],
        ["Employed", 3],
        ["Student", 2],
        ["Retired", 2]
      ),
      workNature: randomElementRatio(
        ["Permanent", 1],
        ["Contract", 4],
        ["Casual", 2]
      ),
      workIndustry: randomElementRatio(
        ["Agriculture", 5],
        ["Manufacturing", 4],
        ["Construction", 6],
        ["Other", 3]
      ),
      openForEmployment: randomElementRatio(["Yes", 5], ["No", 2]),
    },
    insertedAt:
      Date.now() -
      randomElementRatio(
        [0, 5],
        [1000 * 60 * 60 * 24 * 7, 3],
        [1000 * 60 * 60 * 24 * 7 * 2, 2],
        [1000 * 60 * 60 * 24 * 7 * 3, 1]
      ),
  }
}

const USERS_TO_ADD = 250
const populateDb = async () => {
  const users = Array(USERS_TO_ADD).fill().map(createUser)
  console.log("Generated, uploading...")
  await User.insertMany(users)
}

db.connect().then(async () => {
  console.log("Connected")

  await populateDb()

  console.log("Done, inserted", USERS_TO_ADD, "user(s)")

  db.disconnect()
})
