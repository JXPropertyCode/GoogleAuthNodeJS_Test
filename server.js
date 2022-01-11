// to use our .env file variables, we must use this command
require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

// Google Auth
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "156298824903-9kbid3lhcmnvqe1p8o70ej617u335fg2.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT;

// middleware
// ejs automatically looks at a folder called 'views'
// template engine
app.set("view engine", "ejs");
app.use(express.json());
// enable us to set cookies in the browser which we are going to be using to store our users access token for the session
// using cookies to determine whether the user is authenticated and if they can access certain routes
app.use(cookieParser());

app.get("/", (req, res) => {
  // res.send("200 OK")
  // input the ejs file that you want to render
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let token = req.body.token;

  console.log("token received:", token);

  // verifyIdToken is provided by the Google Libarary
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    // payload shows all the user details
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    console.log("payload:", payload);
  }

  // after the token is verified, we would then pass that token to be used in the browser to create a session
  verify()
    .then(() => {
      res.cookie("session-token", token);
      res.send("success");
    })
    .catch(console.error);
});

app.get("/dashboard", checkAuthenticated, (req, res) => {
  let user = req.user;
  res.render("dashboard", { user });
});

app.get("/protectedroute", checkAuthenticated, (req, res) => {
  res.render("protectedroute");
});

app.get("/logout", (req, res) => {
  // clears the cookie when user logs out
  res.clearCookie("session-token");
  // redirect back to /login
  res.redirect("/login");
});

// make sure that the user is authenticated before letting them go to different routes
function checkAuthenticated(req, res, next) {
  // cookie-parser lets us look at the cookies that comes with the request
  let token = req.cookies['session-token'];

  console.log("token received:", token);

  let user = {};

  // verifyIdToken is provided by the Google Libarary
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    // payload shows all the user details
    const payload = ticket.getPayload();

    // store in our user object
    user.name = payload.name;
    user.email = payload.email;
    user.picture = payload.picture;
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    console.log("payload:", payload);
  }

  // after the token is verified, we would then pass that token to be used in the browser to create a session
  verify()
    .then(() => {
      req.user = user;
      next();
    })
    .catch((err) => {
      res.redirect("/login");
    });
}

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});
