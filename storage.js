const fs = require("fs");

module.exports.getBase64File = (file) => {
    return "data:image/png;base64,"+fs.readFileSync(file, 'base64');
}

module.exports.deleteFile = (file) => {
    return new Promise((resolve,reject)=>{
        fs.unlink(file, function (err) {
            if (err) {
                reject(err);
            }
            resolve(true);
        });
    });
}