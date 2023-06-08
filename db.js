const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

module.exports.connect = () =>
  new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGODB_ATLAS_URI, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })

module.exports.disconnect = mongoose.disconnect
