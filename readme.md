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
  - [Using MongoDB Locally](#using-mongodb-locally)
    - [Installation](#installation)
    - [Running](#running)

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
