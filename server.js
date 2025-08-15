require("dotenv").config();
const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const session = require("express-session");

const app = express();

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Routes

// 1. Registration / Login via GitHub
app.get("/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub callback
app.get("/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login-fail" }),
  (req, res) => {
    res.send(`Welcome ${req.user.username}, you are logged in!`);
  }
);

// 2. Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("You have been logged out");
  });
});

// 3. Test route to check login status
app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).send("Not logged in");
  }
});

app.get("/login-fail", (req, res) => res.send("Login failed"));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
