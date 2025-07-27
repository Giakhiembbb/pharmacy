require("dotenv").config();
const express = require('express')
const upload = require("./middleware/multer");
const cloudinary = require("./utils/cloudinary");
const cors = require("cors");

const app = express()
const port = process.env.PORT
app.use(cors());


// Middleware để phân tích các request có body dạng JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post("/upload", upload.single("image"), (req, res) => {
  cloudinary.uploader.upload(req.file.path, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error",
      });
    }
    res.status(200).json({
      success: true,
      message: "Uploaded!",
      data: result,
    });
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
