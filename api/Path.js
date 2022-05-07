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
}

module.exports = path;