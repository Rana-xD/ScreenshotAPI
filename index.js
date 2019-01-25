const app = require('./app');
const aws = require('./aws');
const puppeteer = require('./puppeteer');
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
var fs = require('fs');
var hrstart = process.hrtime();


const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 50 // limit each IP to 20 requests per windowMs
  });

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(limiter);


app.get('/screenshot',(req,res)=>{
    res.status(200).send({
        message: "It's ready"
    });
});

app.post('/screenshot', async (req,res)=>{
    try{
    let fileName = await puppeteer.screenshot(req.body);
    let location = await aws.uploadImage(fileName);
    res.status(200).send({
        location: location
    })
    }
    catch(err){
        res.status(400).send({
            message: err
        })
    }
});

