let path = require("./path");

class Session extends path {
    constructor(app) {
        super(app, "/session");
    }

    async checkSession(id, token) {
        let rows = await this.select({
            select: ["*"],
            from: ["session"],
            where: {
                keys: ["user_id", "token"],
                values: [id, token],
                op: ["AND"]
            }
        });
        return rows.length > 0;
    }

    addEntry(entry, listener) {
        super.addEntry(entry, (req, res) => {
            let id = req.body.id;
            let token = req.body.token;

            if(!this.checkSession(id, token)) {
                res.send({
                    valid: false,
                    cause: "invalid session"
                })
            }else {
                listener(req, res, id, token);
            }
        })
    }

    setup() {
        this.addEntry("/logout", async (req, res, id, token) => {
            let count = await this.delete({
                from: "session",
                where: {
                    keys: ["user_id", "token"],
                    values: [id, token],
                    op: ["AND"]
                }
            })
            res.send({count})
        });

        this.addEntry("/getUser", async (req, res, id) => {
            let user = (await this.select({
                select: ["*"],
                from: ["user"],
                where : {
                    keys: ["id"],
                    values: [id]
                }
            }))[0];
            res.send(user);
        })
    }
}

module.exports = Session;