const mongoose = require("mongoose")
// const { User } = require("./User");

const eventSchema = new mongoose.Schema({
  sessionId:String, // _id: String, //add this using uuidv4  -  https://www.npmjs.com/package/uuidv4
  category:String,// category means like whether it is a legal camp or what !!
  eventName:String,
  eventLocation:String,
  feedback: [
    {
      uid: mongoose.Types.ObjectId,
      content: String,
    },
  ],
  registered:[{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  attended: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  followedUp:[{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
})
// progress ? checklist ? how to maintain ?
// TODO: add fields for adding event description, event images?, 
// event tasks/checklist


const Event = mongoose.model("event", eventSchema)

module.exports = Event
