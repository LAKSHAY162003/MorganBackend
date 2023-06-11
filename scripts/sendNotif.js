require("dotenv").config()
const webPush = require("web-push")

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const sub = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/e_ll7v_3hU8:APA91bHo6nt6M-XnS2NKaceJccKYgK8G7D_oSvjwhV9vWwh8ufk08Lf1mKuWeXTrN06mHss6RhfGut6hXaP3B5sw7aRM3Mx2ysxIZK9AmTfFjipomc6CA7932EUsykKQD2lhOnrHFqjG",
  expirationTime: null,
  keys: {
    p256dh:
      "BBmVUm8T9uwWoRxh8sSslSxw8pTJkJywMZEHO5MPcouMaltOh1wRK8S7aWAukEg8cZOWzQW9A650syozy9Etenw",
    auth: "QBT7s1H4kHz6UpD-6sgw_Q",
  },
}

webPush.sendNotification(sub, "PLease work")
