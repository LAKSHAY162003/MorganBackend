require("dotenv").config();
const express=require("express");
const mongoose =require("mongoose");
const mongodb="mongodb://0.0.0.0:27017/TinyMiraclesDb";
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const Event=require("./schemas/events");
const {User,UserSchema} = require('./schemas/user');
const Admin=require("./schemas/admin");

const app=express();

// basic middlewares !! 
app.use(express.json());
app.use(express.urlencoded({extended:true}));


// Connecting with the database !
mongoose.set("strictQuery", false);
mongoose.connect(mongodb,(err)=>{
    if(err){
        console.log("Unsuccess !!"+err);
    }
    else{
        console.log("MongoDb is connected !!")
    }
})

// Step 1 : do basic setup of connecting with mongodb and all 
// Step2 : create schemas !!
// Step 3 : create routes for data collection 
// Step 4 : create routes for data retrerival !!
// Step 5 : create authentication facility 
// Step 6 : integrate authentication with these routes !! 


// Handling the cors error 
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions));

// authentication : 
function authorize(req,res,next){
    console.log("User Authorized !! ");
    next();
}


// routes : 

// userDataCollectionRoutes !! 

// 1. Collect userDetails { for now on adminSide }
app.post("/user",authorize,(req,res)=>{

        const Name = req.body.name;
        const Age = req.body.age;
        const Dob=req.body.dob;
        const PhoneNumber=req.body.phoneNumber;
        const Address=req.body.address;
        const Community=req.body.community;
        const PrimaryLanguage=req.body.primaryLanguage;
        const NumOfChild=req.body.numOfChild;
        const MaritalStatus=req.body.maritalStatus;
        const Income=req.body.income;
        const currentEducationLevel=req.body.currentEducationLevel;
        const literacyStatus=req.body.literacyStatus;
        const furtherStudyInterest=req.body.furtherStudyInterest;
        const currentEmployment=req.body.currentEmployment;
        const prevEmployment=req.body.prevEmployment;
        const jobTraining=req.body.jobTraining;
        const hospitalizationRecords=req.body.hospitalizationRecords;
        const prescripton=req.body.prescripton;
        const bloodGroup=req.body.bloodGroup;
        const Allergies=req.body.allergies;
        const healthInsurance=req.body.healthInsurance;
        const rationCard=req.body.rationCard;
        const aadharCard=req.body.aadharCard;
        const esharamCard=req.body.esharamCard;
        const panCard=req.body.panCard;
        const voterId=req.body.voterId;


        const currentUser = new User({
            basicDetails:{
                Name,
                Age,
                Dob,
                PhoneNumber,
                Address,
                Community,
                FamilyDetails:{
                    NumOfChild,
                    MaritalStatus,
                    Income
                },
                PrimaryLanguage
            },
            educationStatus:{
                currentEducationLevel,
                literacyStatus,
                furtherStudyInterest
            },
            employmentStatus:{
                currentEmployment,
                prevEmployment,
                jobTraining
            },
            medicalRecords:{
                hospitalizationRecords,
                prescripton,
                bloodGroup,
                Allergies,
                healthInsurance
            },
            govtSchemes:{
                rationCard,
                aadharCard,
                esharamCard,
                panCard,
                voterId
            }
        });


        User.insertMany([currentUser], function (err) {
          if (err) {
            res.status(500).json({message:err.message});
          } else {
             res.status(200).json({message:"Success !!"});
          }
        });

});


// 2. Collect EventDetails {on admin Side}
// Will contains participants / attendance for each event !! 
// this will Ngo them create an event !!
// and post it's attendance !! and progress !!  
app.post("/event",authorize,async (req,res)=>{
    let participants=req.body.participants;// array of userObjects !!
    let feedbacks=req.body.feedbacks// array of objects !!     
    let sessionId=req.body.sessionId;
    let category=req.body.category;
    const attendance = [];
    const feedback=[];
  try {
    await Promise.all(
      participants.map(async (participant) => {
        const result = await User.find({ 'basicDetails.Name': participant.name });
        if (result.length > 0) {
        //   console.log(result[0]);
          attendance.push(result[0]);
        }
      })
    );

    await Promise.all(
        feedbacks.map(async (feedBack) => {
            console.log(feedBack.user.name);
          const result = await User.find({ 'basicDetails.Name': feedBack.user.name });
          if (result.length > 0) {
            // console.log(result[0]);
            feedback.push({
                user:result[0],
                content:feedBack.content
            });
          }
        })
      );

    const currentEvent=new Event({
        sessionId,
        category,
        participants:attendance,
        feedback
    });

    Event.insertMany([currentEvent], function (err) {
        if (err) {
          res.status(500).json({message:err.message});
        } else {
          res.status(200).json({ message: "Success"});
        }
      });

  } catch (err) {
    res.status(500).send({ message: err.message });
  }

});



// data retrival routes { all admin side }

// getting attendance based on sessionId !!
app.get("/event/attendance/:id",authorize,async (req,res)=>{
    try{
        let sessionId=req.params.id; // accessing the request parameters !! 
        const result=await Event.find({sessionId:sessionId});
        
        if(result.length>0){
            res.status(200).json({result:result[0].participants});
        }
        else if(result.length==0){
            res.status(200).json({result:[]});
        }
        
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})

// get userList based on Community { For Community management tool }
app.get("/user/:community",authorize,async (req,res)=>{
    try{
        
        const community=req.params.community;
        const result = await User.find({ 'basicDetails.Community': community});
        if (result.length > 0) {
            res.status(200).json({result:result});
        }
        else{
            res.status(200).json({result:[]});
        }

    } 
    catch(err){
        res.status(500).json({message:err.message});
    }
});


// get all users list !! 
app.get("/user",authorize,async (req,res)=>{

    try{
        const result = await User.find({});
        if (result.length > 0) {
            res.status(200).json({result:result});
        }
        else{
            res.status(200).json({result:[]});
        }

    } 
    catch(err){
        res.status(500).json({message:err.message});
    }

});

// update user's info !!
app.put("/user/update/:name",authorize,async (req,res)=>{
  try {
    const name = req.params.name;
    const updatedData = req.body;

    const updatedUser = await User.findOneAndUpdate
    ({'basicDetails.Name':name}, updatedData, { new: true });
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
    }
    else{
      res.status(200).json(updatedUser);
    }
      
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// search user by name !! 
app.get("/user/search/:name",authorize,async (req,res)=>{
  try{
      const name=req.params.name;
      const result = await User.find({'basicDetails.Name':name});
      if (result.length > 0) {
          res.status(200).json({result:result[0]});
      }
      else{
          res.status(401).json({message:'User Not Found !!'});
      }
  } 
  catch(err){
      res.status(500).json({message:err.message});
  }

});


// get user feedbacks based on sessions 
app.get("/events/feedbacks/:id",authorize,async (req,res)=>{
    try{
        const sessionId=req.params.id;

        const result=await Event.find({sessionId:sessionId});
        if(result.length>0){
            res.status(200).json({result:result[0].feedback});
        }
        else{
            res.status(200).json({result:[]});
        }
    }
    catch(err){
        res.status(500).json({message:err.message});
    }

})


// Data visualization Routes : 

// ofcourse on admin side 
// get users categorized by age { for data visualization }
app.get("/users/age",authorize,async (req,res)=>{
    try{
        const users=await User.find();
        if(users.length>0){
            // console.log(users);
            const result=processData(users);
            res.status(200).json({result:result});
            // using the result property of the json object returned we can 
            // have that object send as prop to the component of chart.js 
        }   
        else{
            res.status(200).json({result:{}});
        }   
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

const processData =(users) => {
    const ageGroups = {};
  
    // Categorize users by age
    users.forEach((user) => {
      const age = user.basicDetails.Age;
  
      // Check if the age group exists, if not create it
      if (!ageGroups[age]) {
        ageGroups[age] = [];
      }
  
      // Add the user to the respective age group
      ageGroups[age].push(user);
    });

        // console.log(ageGroups);

        return processDataForChart(ageGroups);
};

const processDataForChart = (ageGroups) => {
    const labels = Object.keys(ageGroups);
    const data = Object.values(ageGroups).map((usersArray) => usersArray.length);
  
    return {
      labels,
      datasets: [
        {
          label: 'User Count',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
};
  


// get number of benifitieries categorized by community !! { For data visualization } 
app.get("/users/community",authorize,async (req,res)=>{
    try{
        const users=await User.find();
        if(users.length>0){
            // console.log(users);
            const result=processData2(users);
            res.status(200).json({result:result});
            // using the result property of the json object returned we can 
            // have that object send as prop to the component of chart.js 
        }   
        else{
            res.status(200).json({result:{}});
        }   
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

const processData2 =(users) => {
    const communityGroups = {};
    
    // Categorize users by age
    users.forEach((user) => {
      const community = user.basicDetails.Community;
  
      // Check if the age group exists, if not create it
      if (!communityGroups[community]) {
        communityGroups[community] = [];
      }
  
      // Add the user to the respective age group
      communityGroups[community].push(user);
    });

        // console.log(ageGroups);

        return processDataForChart2(communityGroups);
};

const processDataForChart2 = (communityGroups) => {
    const labels = Object.keys(communityGroups);
    const data = Object.values(communityGroups).map((usersArray) => usersArray.length);
  
    return {
      labels,
      datasets: [
        {
          label: 'User Count',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
};



// get users categorized by education levels { For data visualization }
app.get("/users/education",authorize,async (req,res)=>{
    try{
        const users=await User.find();
        if(users.length>0){
            // console.log(users);
            const result=processData3(users);
            res.status(200).json({result:result});
            // using the result property of the json object returned we can 
            // have that object send as prop to the component of chart.js 
        }   
        else{
            res.status(200).json({result:{}});
        }   
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
});

const processData3 =(users) => {
    const educationGroups = {};
    
    // Categorize users by age
    users.forEach((user) => {
      const education = user.educationStatus.currentEducationLevel;
  
      // Check if the age group exists, if not create it
      if (!educationGroups[education]) {
        educationGroups[education] = [];
      }
  
      // Add the user to the respective age group
      educationGroups[education].push(user);
    });

        // console.log(ageGroups);

        return processDataForChart3(educationGroups);
};

const processDataForChart3 = (educationGroups) => {
    const labels = Object.keys(educationGroups);
    const data = Object.values(educationGroups).map((usersArray) => usersArray.length);
  
    return {
      labels,
      datasets: [
        {
          label: 'User Count',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
};



// get attendance count categorized based on session !! 
app.get("/event/attendance",authorize,async (req,res)=>{
  try{
      const events=await Event.find();
      if(events.length>0){
          // console.log(users);
          const result=processData4(events);
          res.status(200).json({result:result});
          // using the result property of the json object returned we can 
          // have that object send as prop to the component of chart.js 
      }   
      else{
          res.status(200).json({result:{}});
      }   
  }
  catch(err){
      res.status(500).json({message:err.message});
  }
});

// key : sessionId
// value : attendance Count !! 
const processData4 =(events) => {
  const attendancePerSession = {};
  
  events.forEach((event) => {
    const sessionId = event.sessionId;
    const participants=event.participants;
    if (!attendancePerSession[sessionId]) {
      attendancePerSession[sessionId] = participants.length;
    }
  });

      // console.log(ageGroups);

      return processDataForChart4(attendancePerSession);
};

const processDataForChart4 = (attendancePerSession) => {
  const labels = Object.keys(attendancePerSession);
  const data = Object.values(attendancePerSession);

  return {
    labels,
    datasets: [
      {
        label: 'User Count',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };
};



app.listen(process.env.PORT || 3000,(req,res)=>{
    console.log("Server Started");
})