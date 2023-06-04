const mongoose = require("mongoose")

// userDetails will be null if admin
const schema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  isAdmin: Boolean,
  userDetails: {
    type: mongoose.Types.ObjectId,
    ref: "UserDetails",
    
  },
})

const User = mongoose.model("user", schema)

module.exports = User
