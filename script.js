const File = require("./models/file");
const fs = require("fs");
const connectDB = require("./config/db");

connectDB(); // building connection with database

async function fetchData() {
  // find files older than 24 hours
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const files = File.find({ createdAt: { $lt: pastDate } });

  try {
    if (files.length) {
      for (const file of files) {
        fs.unlinkSync(file.path);
        await file.remove();
      }
      console.log(`successfully deleted ${file.filename}`);
    }
  } catch (err) {
    console.log(`Error while deleting the file: ${err}`);
  }
}

fetchData().then(process.exit());
