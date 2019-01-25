const AWS = require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv');
const s3 = new AWS.S3({
	    accessKeyId: "AKIAILZVII6JRV5JUU3A", //required
	    secretAccessKey: "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" //required
       });
       
dotenv.config();


module.exports.uploadImage = (file) => {
	    return new Promise((resolve,reject)=>{
	        fs.readFile(file, function (err, data) {
	            if (err) throw err; // Something went wrong!
	                var fileName = file.substring(5);
	                var params = {
	                    Bucket:process.env.BUCKET,
	                    Key: "diff/"+ fileName, //file.name doesn't exist as a property
	                    Body: data,
                        ACL: 'public-read',
                        ContentType: 'image/png'
	                };
	                s3.upload(params, function (err, data) {
	                    // Whether there is an error or not, delete the temp file
	                    if (err) {
	                        console.log('ERROR MSG: ', err);
	                        reject(err);
	                    } else {
	                        fs.unlink(file, function (err) {
	                            if (err) {
									console.log(err);
									reject(err);
                                }
	                        });
	                        resolve(data.Location);
	                    }
	                });
	            });
	
	    });
	
	
	}