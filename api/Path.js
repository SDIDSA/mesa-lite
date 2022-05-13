class path {
    constructor(app, path) {
        this.app = app;
        this.path = path;
    }

    addEntry(entry, listener) {
        this.app.post(this.path + entry, (req, res) => {
            listener(req, res);
        })
    }

    async select(data, schema) {
        return (await this.app.db.select(data, schema));
    }

    async delete(data) {
        return (await this.app.db.delete(data));
    }

    async insert(data, returning) {
        return await this.app.db.insert(data, returning);
    }

    async update(data) {
        return (await this.app.db.update(data));
    }
}

module.exports = path;