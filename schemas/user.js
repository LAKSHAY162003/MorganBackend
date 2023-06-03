const mongoose =require("mongoose");

const UserSchema=new mongoose.Schema({
    basicDetails:{
        Name:String,
        Age:Number,
        Dob:Date,
        PhoneNumber:Number,
        Address:String,
        Community:String,
        FamilyDetails:{
            NumOfChild:Number,
            MaritalStatus:String,
            Income:Number
        },
        PrimaryLanguage:String
    },
    educationStatus:{
        currentEducationLevel:String,
        literacyStatus:String,
        furtherStudyInterest:String
    },
    employmentStatus:{
        currentEmployment:String,
        prevEmployment:String,
        jobTraining:String
    },
    medicalRecords:{
        hospitalizationRecords:String,
        prescripton:String,
        bloodGroup:String,
        Allergies:String,
        healthInsurance:String
    },
    govtSchemes:{
        rationCard:String,
        aadharCard:String,
        esharamCard:String,
        panCard:String,
        voterId:String
    }
    // These are strings because : either "yes" or "no" !! 
})

// admin schema needs to be different because all the details of the user 
// schema are of no use for admin !! 

const User=mongoose.model("user",UserSchema);

module.exports = {
    User,
    UserSchema,
};