require("dotenv").config();
const mongoose = require("mongoose");

function connectDB() {
  mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
    useNewUrlParser: true,
  });
  const connection = mongoose.connection;
  connection
    .once("open", () => {
      console.log("Database connected");
    })
    .on("error", function (err) {
      console.log("Database connection failed. Error message = " + err);
    });
}

module.exports = connectDB;
