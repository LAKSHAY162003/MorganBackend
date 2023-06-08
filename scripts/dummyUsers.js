const db = require("../db")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const fs = require("fs")
const crypto = require("crypto")

require("dotenv").config()

const USERS_TO_ADD = 1000

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

const randomString = (length = 8, space = "qwertyuopasdfghjklzxcvbnm") => {
  return Array(length)
    .fill()
    .map(() => randomElement(space))
    .join("")
}

const createUser = () => {
  return {
    _id: crypto.randomUUID(),
    pwd: bcrypt.hashSync(randomString(), 10),
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
        income: Math.floor(Math.random(29) + 1) * 1000,
        dependents: Math.floor(Math.random() * 6),
      },
      primaryLanguage: randomElement([
        "Marathi",
        "Marathi",
        "Marathi",
        "Marathi",
        "Marathi",
        "Hindi",
        "Hindi",
        "Hindi",
        "English",
        "Other",
        "Other",
        "Other",
      ]),
    },
    educationStatus: {
      educationStatus: randomElement([
        "No Education",
        "No Education",
        "No Education",
        "No Education",
        "No Education",
        "Primary School",
        "Primary School",
        "Primary School",
        "Middle School",
        "Middle School",
        "10th",
        "12th",
        "12th",
        "Diploma",
        "Graduate",
      ]),
      ongoingEducation: randomElement(["No", "No", "No", "Yes", "Yes"]),
      ongoingEducation: randomElement(["No", "No", "Yes"]),
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
    },
    SocioeconomicStatus: {
      cleanWaterAccess: randomElement(["Yes", "No"]),
      electricityAccess: randomElement(["Yes", "No"]),
      transportationAccess: randomElement(["Public", "Private", "None"]),
      housingType: randomElement(["Kutcha", "Semi-Pucca", "Pucca"]),
    },
    govtSchemes: {
      rationCard: randomElement(["Yes", "No"]),
      aadharCard: randomElement(["Yes", "No"]),
      esharamCard: randomElement(["Yes", "No"]),
      panCard: randomElement(["Yes", "No"]),
      voterId: randomElement(["Yes", "No"]),
    },
  }
}

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


