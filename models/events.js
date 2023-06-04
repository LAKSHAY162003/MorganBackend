const mongoose = require("mongoose")
const { User } = require("./User")

const eventSchema = new mongoose.Schema({
  category: String,
  feedback: [
    {
      uid: mongoose.Types.ObjectId,
      content: String,
    },
  ],
  registered: [mongoose.Types.ObjectId],
  attended: [mongoose.Types.ObjectId],
  followedUp: [mongoose.Types.ObjectId],
})
// progress ? checklist ? how to maintain ?
// TODO: add fields for adding event description, event images?, event tasks/checklist


const Event = mongoose.model("event", eventSchema)

module.exports = Event
