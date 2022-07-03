let path = require("./path");

class Session extends path {
    constructor(app) {
        super(app, "/session");
    }

    async checkSession(id, token) {
        let rows = await this.select({
            select: ["user_id"],
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

            if (!this.checkSession(id, token)) {
                res.send({
                    valid: false,
                    cause: "invalid session"
                })
            } else {
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
            res.send({ count })
        });

        this.addEntry("/getUser", async (req, res, id) => {
            let user = (await this.select({
                select: ["*"],
                from: ["user"],
                where: {
                    keys: ["id"],
                    values: [id]
                }
            }))[0];
            res.send(user);
        })

        this.addEntry("/userSearch", async (req, res, id) => {
            let found = await this.select({
                select: ["id", "username", "avatar"],
                from: ["user"],
                where: {
                    keys: ["username", "id"],
                    values: [`%${req.body.query}%`, id],
                    op: ["AND"],
                    comp: [" ILIKE ", "<>"]
                }
            })

            res.send({ found })
        })

        this.addEntry("/send", async (req, res, id) => {
            let data = req.body;

            if (data.chat == -1) {
                console.log("new chat");
                if (data.to.length == 1) {
                    console.log("one target");

                    let found = (await this.manual(
                        "SELECT id AS chat_id \
                            FROM \
                                (SELECT chat.id, ARRAY_AGG(member.user_id) AS members \
                                    FROM public.chat, public.member \
                                        WHERE (user_id=$1 OR user_id=$2) \
                                        AND private=true \
                                        AND public.chat.id = public.member.chat_id \
                                        GROUP BY chat.id) \
                                AS chats \
                            WHERE CARDINALITY(members) = 2;",
                        [id, data.to[0]]
                    ))
                    let chat_id = -1;
                    if (found.length == 0) {
                        let ch_id = (await this.insert({
                            table: "chat",
                            keys: [
                                "private"
                            ],
                            values: [
                                true
                            ]
                        }, "id")).rows[0].id;

                        await this.insert({
                            table: "member",
                            keys: [
                                "user_id",
                                "chat_id",
                                "privilege"
                            ],
                            values: [
                                id,
                                ch_id,
                                "member"
                            ]
                        })

                        await this.insert({
                            table: "member",
                            keys: [
                                "user_id",
                                "chat_id",
                                "privilege"
                            ],
                            values: [
                                data.to[0],
                                ch_id,
                                "member"
                            ]
                        })

                        chat_id = ch_id;
                    } else {
                        chat_id = found[0].chat_id;
                    }

                    //SEND MESSAGE IN [chat_id]
                    
                    console.log(chat_id);
                } else {
                    console.log("multi target")
                    console.log("creating chat...")
                    let resu = await this.insert({
                        table: "chat",
                        keys: [
                            "name"
                        ],
                        values: [
                            "group chat"
                        ]
                    }, "id");

                    console.log("chat created, id = " + resu.rows[0])
                }
            } else {
                console.log("existing chat");
            }

        })
    }
}

module.exports = Session;