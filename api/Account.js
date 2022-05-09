const Path = require("./Path");

function isValiEmail(val) {
    let regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regEmail.test(val);
}

class Account extends Path {
    constructor(app) {
        super(app, "/account");
    }

    async checkUsername(username) {
        return (await this.select({
            select: ["*"],
            from: ["user"],
            where: {
                keys: ["username"],
                values: [username]
            }
        })).length > 0;
    }

    async checkEmail(email) {
        return (await this.select({
            select: ["*"],
            from: ["user"],
            where: {
                keys: ["email"],
                values: [email]
            }
        })).length > 0;
    }

    setup() {
        this.addEntry("/signup", async (req, res) => {
            let username = req.body.username;
            let birthdate = req.body.birthdate;
            let email = req.body.email;
            let password = req.body.password;

            let err = [];

            if (password.length < 6) {
                err.push({
                    key: "password",
                    value: "must be of at least 6 characters"
                })
            }

            if (username.length < 4) {
                err.push({
                    key: "username",
                    value: "must be of at least 4 characters"
                })
            }

            let chkuser = await this.checkUsername(username);
            if (chkuser) {
                err.push({
                    key: "username",
                    value: "this username is taken"
                })
            }

            let chkmail = await this.checkEmail(email);
            if (chkmail) {
                err.push({
                    key: "email",
                    value: "this email address has already been used"
                })
            }

            if (!isValiEmail(email)) {
                err.push({
                    key: "email",
                    value: "invalid email format"
                })
            }

            if (err.length == 0) {
                let avatar = await this.app.media.generateAvatar(username);
                this.insert({
                    table: "user",
                    keys: [
                        "username",
                        "birthdate",
                        "email",
                        "password",
                        "avatar"
                    ],
                    values: [
                        username,
                        birthdate,
                        email,
                        password,
                        avatar
                    ]
                })

                res.send({ status: "success" });
            } else {
                res.send({
                    err
                })
            }

            //TODO sign up
        });

        this.addEntry("/login", (req, res) => {
            let email = req.body.email;
            let password = req.body.password;
            res.send({ email, password });

            //TODO login
        });
    }
}

module.exports = Account;