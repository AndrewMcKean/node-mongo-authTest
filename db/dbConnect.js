// extenal imports
const mongoose = require("mongoose");
require('dotenv').config()

async function dbConnect() {
  mongoose
  .connect(
    process.env.DB_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //useCreateIndex: true deprecated
    }
  )

  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
  })
  .catch((e) => {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(e);
  });

}

module.exports = dbConnect;