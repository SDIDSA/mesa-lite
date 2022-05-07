const Path = require("./Path");

class Account extends Path {
    constructor(app) {
        super(app, "/account");
    }

    setup() {
        this.addEntry("/signup", (req, res) => {
            res.send("signing up...");

            //TODO sign up
        });

        this.addEntry("/login", (req, res) => {
            res.send("logging in...");

            //TODO sign up
        });
    }
}

module.exports = Account;