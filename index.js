const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const yup = require("yup");
const { nanoid } = require("nanoid");
const monk = require("monk");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use(express.static("./public"));

// create short url
app.post("/url", async (req, res, next) => {
  try {
    let { slug, url } = req.body;
    await schema.validate({ slug, url });

    slug = slug?.toLowerCase();

    if (!slug) {
      while (true) {
        slug = nanoid(5).toLowerCase();
        const duplicate = await urls.findOne({ slug });
        if (!duplicate) {
          break;
        }
      }
    } else {
      const duplicate = await urls.findOne({ slug });
      if (duplicate) {
        throw new Error("Slug in use 🐌");
      }
    }

    const created = urls.insert({ slug, url });
    res.status(200).json({ created });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }

  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? "💥" : error.stack,
  });
});

app.get("*", (req, res) => {
  res
    .status(404)
    .json({ status: "404", data: "OOPs seems like there's nothing here yet" });
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
