# Things Learned

This is a temporary readme which will be distributed into other notes later

## Contents

<!-- toc -->

- [Things Learned](#things-learned)
  - [Contents](#contents)
  - [New Useful NPM Packages](#new-useful-npm-packages)
  - [Middleware & Error Handling](#middleware--error-handling)
    - [next()](#next)
    - [Behaviour](#behaviour)
  - [Specifying node version for deployment](#specifying-node-version-for-deployment)
  - [Using MongoDB Locally](#using-mongodb-locally)
    - [Installation](#installation)
    - [Running](#running)
  - [Indexes in Mongo DB](#indexes-in-mongo-db)
    - [Issues faced with indexing](#issues-faced-with-indexing)
  - [Basic Web Dev](#basic-web-dev)
    - [Inline event handlers](#inline-event-handlers)
    - [Labels and `for` and `name`](#labels-and-for-and-name)
    - [Looping FormData](#looping-formdata)
    - [Slug (NP)](#slug-np)

<!-- tocstop -->

## New Useful NPM Packages

1. yup: schema validator
2. nanoid : id generator
3. monk: seems like a very light ORM for mongo

## Middleware & Error Handling

### next()

Some details about `next()` function

Calling this function invokes the next middleware function in the app. The next() function is not a part of the Node.js or Express API, but is the third argument that is passed to the middleware function. The next() function could be named anything, but by convention it is always named “next”. To avoid confusion, always use this convention.

If you pass anything to the next() function (except the string 'route' or 'router'), Express regards the current request as being an error and will skip any remaining non-error handling routing and middleware functions.

### Behaviour

Look at the code below

As stated above to reach the error handling middleware function (the last `app.use`) I would have to pass `next(error)`

The thing to note here is that, the `next()` call in post will not go to the next middleware which is a `get` handler, instead it will jum to the `app.use()` middleware which is simply printing out `Logged`

So `next()` skips enpoint handlers it seems (ie get, post, put)

> Note: This isn't error free code, If the put request resulted in error, we would be stuck as no response is being sent back from the logger function and it does not call another next() to move on either

```js
app.post("/url", async (req, res, next) => {
  let { slug, url } = req.body;

  try {
    await schema.validate({ slug, url });

    if (!slug) {
      slug = nanoid(5);
    }

    slug = slug.toLowerCase();

    res.status(200).json({ slug, url });
  } catch (error) {
    next(); //incorrect
    // next(error) //correct
  }
});

app.get("/url/:id", () => {
  console.log("hello");
});

app.use((req, res) => {
  console.log("Logged");
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
```

## Specifying node version for deployment

[stackoverflow](https://stackoverflow.com/questions/29349684/how-can-i-specify-the-required-node-js-version-in-package-json)

```json
  "engines": {
    "node": ">=10.0.0",
    "npm": ">=6.0.0"
  },
```

## Using MongoDB Locally

Been a while since I have done this.

### Installation

1. [Installing Mondb on Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
2. Download MongoDB Combass `deb` file from internet
3. Next install as follows. [Details on installing deb files](https://unix.stackexchange.com/questions/159094/how-to-install-a-deb-file-by-dpkg-i-or-by-apt)

   ```bash
   sudo dpkg -i /path/to/deb/file
   sudo apt-get install -f
   ```

### Running

Must first start a `mongod` process on the terminal.

Otherwise can't connect `compass` or run `mongo` command successfully in the terminal

Details on [starting mongo](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#run-mongodb-community-edition): Scroll down for command details

Summary commands for starting/stopping `mongod` process

```bash
# start mongod process
sudo systemctl start mongod
# status of mongod process
sudo systemctl status mongod
# stop mongod process
sudo systemctl stop mongod
# restart mongod process
sudo systemctl restart mongod

# use mongoDB in the terminal
mongo
```

## Indexes in Mongo DB

Indexes work similarly in mongo as with other DB

Indexes can be used to make fields unique, An example using monk

```js
const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
// This will make slug property unqiue for each document
urls.createIndex({ slug: 1 }, { unique: true });
```

### Issues faced with indexing

In order to properly use indexes

The database and collection should already be set up. Read what happened below

> I dropped my collection and db, which means they were created after the first insert. Since the index creation rubs at the begining (in global scope) when node first runs, it fails then because the collection and/or db did not exists. So if you are using Indexes make sure the db and collections are already created

## Basic Web Dev

### Inline event handlers

Dont us inline event handlers like this

```html
<form id="url-form" onsubmit="handleSubmit()"></form>
```

They can produce error

```bash
Refused to execute inline event handler because it violates the following Content Security Policy directive: "script-src-attr 'none'". Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to enable inline execution. Note that hashes do not apply to event handlers, style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is present.
```

Just add the eventListener in the JS script instead

### Labels and `for` and `name`

Always forget for property of a `label` must match the respective `name` property of the input element ie input, select tags

Otherwise things like `FormData` don't work

```html
<form id="form-1">
  <label for="url">URL</label>
  <input name="url" type="text" />
</form>
```

### Looping FormData

Getting all for data and creating an object to convert to json string

```js
const formData = new FormData(form);
const formDataObj = {};

for (let pair of formData.entries()) {
  console.log(pair);
  if (pair[1] !== "") {
    formDataObj[pair[0]] = pair[1];
  }
}
```

`for (let pair of formData.entries())` will return the name and value of the form constituents in arrays. Lets say we have a form with 2 fields. Then pair is as follows

```bash
['name', 'Sadnan'] # 1st loop
['age', '27'] # 2nd Loop
```

### Slug (NP)

1. [Slug in URLs](https://en.wikipedia.org/wiki/Clean_URL#:~:text=It%20is%20usually%20the%20end,an%20article%20for%20internal%20use.)
2. [Slug History](<https://en.wikipedia.org/wiki/Slug_(publishing)>)
