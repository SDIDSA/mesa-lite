require('dotenv').config();
let cors = require("cors");
const express = require("express");
const Account = require('./api/Account');
const app = express();
app.use(express.json());
app.use(cors());

var db = require('./db/db.js');
const media = require('./media/media');

app.db = new db();
app.media = new media();

let account = new Account(app);
account.setup();

app.post("/", (req, res) => {
    res.end(JSON.stringify(req.body));
});

app.listen(process.env.PORT, () => {
    console.log("listening on port " + process.env.PORT);
});