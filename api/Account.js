const Path = require("./Path");
var crypto = require('crypto');

var generateKey = function () {
    return crypto.randomBytes(16).toString('base64');
};

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

    async checkSession(token) {
        let rows = await this.select({
            select: ["*"],
            from: ["session"],
            where: {
                keys: ["token"],
                values: [token]
            }
        });
        return rows.length > 0 ? rows[0].user_id : -1;
    }

    async generateSession() {
        let token = generateKey();
        while ((await this.checkSession(token)) != -1) {
            token = generateKey();
        }
        return token;
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
                await this.insert({
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
        });

        this.addEntry("/login", async (req, res) => {
            let email = req.body.email;
            let password = req.body.password;

            let users = await this.select({
                select: ["id"],
                from: ["user"],
                where: {
                    keys: ["email", "password"],
                    values: [email, password],
                    op: ["AND"]
                }
            });

            if (users.length == 1) {
                let token = await this.generateSession();
                await this.insert({
                    table: "session",
                    keys: ["user_id", "token"],
                    values: [users[0].id, token]
                })
                res.send({ token: token })
            } else {
                res.send({
                    err: [
                        {
                            key: "email",
                            value: "invalid email/password combination"
                        },
                        {
                            key: "password",
                            value: "invalid email/password combination"
                        }
                    ]
                })
            }
        });

        this.addEntry("/checkToken", async (req, res) => {
            let id = await this.checkSession(req.body.token);
            setTimeout(() => {
                res.send({
                    id
                })
            }, 1000)
        })
    }
}

module.exports = Account;