const AWS = require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
// const logger = require('./log')
const s3 = new AWS.S3({
	    accessKeyId: process.env.AWS_ACCESS_KEY, //required
	    secretAccessKey: process.env.AWS_SECRET_KEY //required
       });

module.exports.uploadImage = (file,path) => {
	return new Promise((resolve,reject)=>{
		fs.readFile(file, function (err, data) {
			if (err) throw err; // Something went wrong!
				var fileName = file.substring(5);
				var params = {
					CreateBucketConfiguration: {
						// Set your region here
						LocationConstraint: process.env.S3_REGION
					},
					Bucket:process.env.BUCKET,
					Key: path + fileName, //file.name doesn't exist as a property
					Body: data,
					ACL: 'public-read',
					ContentType: 'image/png'
				};
				s3.upload(params, function (err, data) {
					// Whether there is an error or not, delete the temp file
					if (err) {
						// logger.log.error(err);
						reject(err);
					} else {
						fs.unlink(file, function (err) {
						if (err) {
							// logger.log.error(err);
							reject(err);
						}
					// logger.log.info(`Path: ${data.Location}`);
					resolve(data.Location);
				});
						
				}
			});
		});
	});
}