const app = require('./app');
const storage = require('./storage');
const puppeteer = require('./puppeteer');
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit')


const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minute
	max: 50, // Limit each IP to 10 create account requests per `window` (here, per hour)
	message:
		'Too many requests, please try again after 5 minute',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));

app.use(limiter);

app.get('/',(req,res)=>{
	res.status(200).send({
		message: "It's ready"
	});
});

app.get('/screenshot',(req,res)=>{
	res.status(200).send({
		message: "It's ready"
	});
});

app.post('/screenshot', async (req,res,next)=>{
	let fileName;

	try{
		fileName = await puppeteer.screenshot(req.body);
		res.sendFile(
			fileName,
			{
				root: __dirname
			},
			async (err) => {
				if (err) {
					next(err);
				}

				await storage.deleteFile(fileName);
			}
		);
	} catch(err) {
		res.status(400).send({
			message: err.message
		});

		if (fileName) {
			await storage.deleteFile(fileName);
		}
	}
});

