const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const yup = require("yup");
const { nanoid } = require("nanoid");
const monk = require("monk");

console.log(process.env.NODE_ENV);

if (process.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT || 8000;

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

const db = monk(process.env.MONGO_URI);
console.log(process.env.MONGO_URI);

const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use(express.static("./public"));

// redirect using short url
app.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    slug.toLowerCase();
    const foundUrl = await urls.findOne({ slug });

    if (foundUrl) {
      return res.redirect(foundUrl.url);
    }
    return res.redirect(`/?error=${slug} not found`);
  } catch (error) {
    next(error);
  }
});

// create short url
app.post("/url", async (req, res, next) => {
  try {
    console.log(req.body);
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
    }
    const created = await urls.insert({ slug, url });
    return res.status(200).json({ created });
  } catch (error) {
    if (error.message.startsWith("E11000")) {
      error.message = {
        error: "Slug in use 🐌",
        details: error.message,
      };
    }
    console.log("caught error");
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }

  return res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? "💥" : error.stack,
  });
});

app.get("*", (req, res) => {
  return res
    .status(404)
    .json({ status: "404", data: "OOPs seems like there's nothing here yet" });
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
