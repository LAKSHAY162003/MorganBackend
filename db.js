const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

module.exports.connect = () =>
  new Promise((resolve, reject) => {
    mongoose.connect(process.env.DB_URL, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
