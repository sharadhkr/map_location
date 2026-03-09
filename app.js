const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const session = require("express-session"); // Required for session management
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// Session setup
app.use(
    session({
        secret: "your-secret-key", // Replace with a secure key
        resave: false,
        saveUninitialized: false,
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(
    new LocalStrategy((username, password, done) => {
        // Replace this with your actual user authentication logic
        if (username === "user" && password === "password") {
            return done(null, { id: 1, username: "user" });
        } else {
            return done(null, false, { message: "Incorrect username or password" });
        }
    })
);

// Serialize and Deserialize User
passport.serializeUser ((user, done) => {
    done(null, user.id);
});

passport.deserializeUser ((id, done) => {
    // Replace this with your actual user lookup logic
    const user = { id: 1, username: "user" };
    done(null, user);
});

// Set up EJS and static files
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
    })
);

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

// Socket.io setup
const users = {};
io.on("connection", (socket) => {
    console.log("a user connected");

    socket.emit("initial-users", users);

    socket.on("send-location", (data) => {
        users[socket.id] = data;
        io.emit("recive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("user-dissconenct", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});