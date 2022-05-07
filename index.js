require('dotenv').config();

const express = require("express");
const Account = require('./api/Account');
const app = express();
app.use(express.json());

let account = new Account(app);
account.setup();

app.post("/", (req, res) => {
    res.end(JSON.stringify(req.body));
});

app.listen(process.env.PORT, () => {
    console.log("listening on port " + process.env.PORT);
});