const express = require('express');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const UserModel = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
    console.log(chalk.hex('#03befc').bold("~ Homepage loaded!"));
    res.render('index.ejs');
});

app.post('/create', (req, res) => {
    const { username, email, password, age } = req.body;

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hashedPassword) {
            const createdUser = await UserModel.create({ username, email, password: hashedPassword, age });

            const token = jwt.sign({ email }, 'BluePineapple');
            res.cookie("jwtToken", token);
            res.cookie("user", username);

            console.log(chalk.hex('#03befc').bold("~ Created an user!"));
            res.redirect("/");
        });
    });
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });

    if (!user) {
        res.send("Invalid credentials!");
    }
    else {
        bcrypt.compare(password, user.password, function (err, result) {
            if (result) {
                const token = jwt.sign({ email: user.email }, 'BluePineapple');
                res.cookie("jwtToken", token);
                res.cookie("user", user.username);

                console.log(chalk.hex('#03befc').bold("~ Logged in an user!"));
                res.redirect("/");
            }
            else {
                console.log(chalk.hex('#03befc').bold("~ Invalid user credentials!"));
                res.redirect("/");
            }
        });

    }
});

app.get('/logout', (req, res) => {
    res.cookie("jwtToken", "");
    res.cookie("user", "");
    console.log(chalk.hex('#03befc').bold("~ Logged out an user!"));
    res.redirect("/");
});

app.listen(8080, () => {
    console.log(chalk.hex('#ffd000').underline.bold("--- SERVER RUNNING AT PORT 8080 ---"));
});