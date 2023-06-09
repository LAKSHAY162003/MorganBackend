const mongoose = require("mongoose")
// new Schema({...data})
const UserSchema = new mongoose.Schema(
  {
    pwd: { type: String, unique: true },
    role: String,
    isFakeUser: {
      type: Boolean,
      default: false,
    },
    _id: String, //add this using uuidv4  -  https://www.npmjs.com/package/uuidv4
    basicDetails: {
      name: String,
      age: Number,
      gender: String, //add  , also removed DOB
      PhoneNumber: { type: Number, unique: true }, // Phone number is now unique
      address: {
        //add (nested inside basic details)
        address1: String,
        state: String,
        city: String,
        zip: String,
      },
      Community: String,
      familyDetails: {
        numOfChild: Number,
        maritalStatus: String,
        income: Number,
        dependents: Number, //add
      },
      primaryLanguage: String,
    },
    educationStatus: {
      currentEducationLevel: String,
      ongoingEducation: String, //yes, no
      //  literacyStatus: String,     delete it  --- not needed
      furtherStudyInterest: String, //yes, no
    },
    employmentStatus: {
      currentEmployment: String, //employed, unemployed, retired, student
      workNature: String, //nature of work (permanent, contract, casual),
      workIndustry: String, //industry of work (agriculture, manufacturing, construction, etc.)
      prevEmployment: String,
      openForEmployment: String, //open for employment (yes, no)
    },
    SocioeconomicStatus: {
      //add this , easy to get from the user and for dashboard visualization
      cleanWaterAccess: String, //yes, no
      electricityAccess: String, //yes, no
      housingType: String, //yes, no
      transportationAccess: String, //yes, no
    },
    medicalRecords: {
      hospitalizationRecords: String,
      chronicIllnesses: String, // add
      currentMedications: String, // add
      bloodGroup: String,
      allergies: String,
      vaccinationRecords: String, //yes, no
      healthInsurance: String,
    },
    govtSchemes: {
      rationCard: String,
      aadharCard: String,
      esharamCard: String,
      panCard: String,
      voterId: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    insertedAt: Date,
    subs: [
      {
        endpoint: { type: String },
        keys: {
          p256dh: String,
          auth: String,
        },
      },
    ],
  },
  { timestamps: true }
)

const User = mongoose.model("user", UserSchema)

module.exports = User
