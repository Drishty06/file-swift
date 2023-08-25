const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: storage,
  limit: { fileSize: 1000000 * 100 },
}).single("document");

router.post("/", (req, res) => {
  // store files
  upload(req, res, async (err) => {
    // validate req
    if (!req.file) {
      return res.json({
        error: "Please add a file",
      });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }

    // store into database
    const file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
    // http:localhost:3002/files/325849thwjkfh-kdhfi3940986
  });
});

router.post("/send", async (req, res) => {
  // validate req
  const { uuid, receiverEmail, senderEmail } = req.body;
  if (!uuid || !receiverEmail || !senderEmail) {
    return res.status(422).send({ error: "All fields are required" });
  }

  //get data from database
  const file = await File.findOne({ uuid: uuid });
  if (file.sender) {
    return res.status(422).send({ error: "Email already sent" });
  }

  file.sender = senderEmail;
  file.receiver = receiverEmail;
  const response = await file.save();

  // send mail
  const sendMail = require("../services/emailService");
  sendMail({
    from: senderEmail,
    to: receiverEmail,
    subject: "FileSwift file sharing link",
    text: `${senderEmail} has shared a file with you.`,
    html: require("../services/emailTemplate")({
      senderEmail: senderEmail,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
      size: parseInt(file.size / 1000) + "KB",
      expires: "24 hours",
    }),
  });

  return res.send({ success: true });
});

module.exports = router;
