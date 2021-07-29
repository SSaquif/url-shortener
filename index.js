const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const PORT = process.env.PORT || 8000;

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use(express.static("./public"));

// app.get("/url", (req, res) => {
//   res.status(200).json({ status: "200", data: "hey this the homepage" });
//   //TODO: create a short url
// });

// app.get("/url/:id", (req, res) => {
//   //TODO: create a short url
// });

// app.get("*", (req, res) => {
//   res
//     .status(404)
//     .json({ status: "404", data: "OOPs seems like there's nothing here yet" });
// });

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
