const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  basicDetails: {
    name: String,
    age: Number,
    dob: Date,
    phoneNumber: Number,
    address: String,
    community: String,
    familyDetails: {
      numOfChild: Number,
      maritalStatus: String,
      income: Number,
    },
    primaryLanguage: String,
  },
  educationStatus: {
    currentEducationLevel: String,
    literacyStatus: String,
    furtherStudyInterest: String,
  },
  employmentStatus: {
    currentEmployment: String,
    prevEmployment: String,
    jobTraining: String,
  },
  medicalRecords: {
    hospitalizationRecords: String,
    prescripton: String,
    bloodGroup: String,
    allergies: String,
    healthInsurance: String,
  },
  govtSchemes: {
    rationCard: String,
    aadharCard: String,
    eSharamCard: String,
    panCard: String,
    voterId: String,
  },
})

const UserDetails = mongoose.model("userDetails", schema)

module.exports = UserDetails
