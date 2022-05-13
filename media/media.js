let pfp_temp = "https://avatars.dicebear.com/api/bottts/{user_id}.png?radius=50&background=black&size=256&scale=80";

class Media {
    constructor() {
        this.cloudinary = require('cloudinary');
        this.cloudinary.config({
            cloud_name: 'dhkwrjyxd',
            api_key: '791477273826251',
            api_secret: 'gsyCbIbO9QUe8dmHw8IxymRJtsk'
        });
    }

    async uploadRemote(remoteLink, name) {
        return new Promise((resolve, reject) => {
            this.cloudinary.v2.uploader.upload(remoteLink, {
                public_id: name
            }, (err, res) => {
                if (err) return reject(err);
                return resolve(res.url);
            })
        });
    }

    async uploadFile(path, options) {
        return new Promise((resolve, reject) => {
            this.cloudinary.v2.uploader.upload(path, options, (err, res) => {
                if (err) return reject(err);
                return resolve(res.url);
            })
        });
    }

    async generateAvatar(user_id) {
        let link = pfp_temp.replace("{user_id}", user_id);
        console.log(link);
        return await this.uploadRemote(link, "pfp_" + user_id);
    }
}

module.exports = Media;