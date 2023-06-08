const mongoose = require("mongoose")
// const { User } = require("./User");

const eventSchema = new mongoose.Schema({
  _id:String, // _id: String, //add this using uuidv4  -  https://www.npmjs.com/package/uuidv4
  category:String,// category means like whether it is a legal camp or what !!
  eventName:String,
  eventLocation:String,
  feedback: {
    type:[
    {
      uid: String,
      content: String,
    }],
    default:[]
  },
  //  mongoose.Schema.Types.ObjectId : this is not used bcz : 
  // we are using non standard technique to generate id !! 
  // to save us from BSONTYPE ERROR WE DID THIS !!
  // ref :user is creating some index errors / uniqueness errors !! 
  attended:{
    type:[{ type: String}],
    default:[]
  },
  registered:{
    type:[{ type: String}],
    default:[]
  },
  followedUp:{
    type:[{ type: String}],
    default:[]
  },
  eventStartTime: Date,
  eventDuration:Number,
  eventDetails:String,
  imageUrl:{
    type:String,
    default:'https://tinymiracles.com/wp-content/uploads/2019/07/logos_tm1-black-tag.png'
  }
})
// progress ? checklist ? how to maintain ?
// TODO: add fields for adding event description, event images?, 
// event tasks/checklist


const Event = mongoose.model("event", eventSchema)

module.exports = Event
