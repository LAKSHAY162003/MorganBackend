require("dotenv").config()
const webPush = require("web-push")

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const sub = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/ePS-CMjbk9M:APA91bFCz2W1k943d2YzwM2uArErHRjrN-zNgX3C-gKdytm_JEErYfE2kexn_rdztvTuyvt_8YppbgQ8j8DhW6gSE7rVoYZPqw_a-4Jwj2kR0QMcHush18D1UbDHNDwSaNcRAqVYhh0i",
  expirationTime: null,
  keys: {
    p256dh:
      "BAgnOfsfAA5IKCYVjpIQ7HHQbDgdyjfEBSC7plHOYwyXzjGo7E5-7GYEsgDL51HlV_Hfx1jOWj4JeT8ZKQrv9QM",
    auth: "9A107-1S6ND1yIi9v9yWoQ",
  },
}

webPush.sendNotification(
  sub,
  JSON.stringify({ title: "Hello", body: "PLease work" })
)
