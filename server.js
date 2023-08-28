const express = require("express");
const app = express();
const path = require("path");

const connectDB = require("./config/db");
connectDB();

const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.static("public")); // static middleware
app.use(express.json());

// template engine

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
//routes

app.use("/api/files", require("./routes/files"));
app.use("/files", require("./routes/show"));
app.use("/files/download", require("./routes/download"));

app.listen(PORT, () => {
  console.log(`Server is listening on port no. ${PORT}`);
});
