require("dotenv").config()
const express = require("express")
const cors = require("cors")
const db = require("./db")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
)

app.use("/user", require("./routes/user"))
app.use("/events", require("./routes/events"))

app.all("*", (_, res) => {
  res.json({ error: true, message: "route not found" })
})

db.connect().then(() => {
  app.set("port", process.env.PORT || 5000)
  app.listen(app.get("port"), () => {
    console.log(`Server Started on http://localhost:${app.get("port")}`)
  })
})
