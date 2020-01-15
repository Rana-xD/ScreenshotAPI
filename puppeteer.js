const puppeteer = require('puppeteer-core');
const randomstring = require('randomstring');


module.exports.screenshot = (body) => {
	let url = body.url;
	let width = body.width;
	let isAuthenticated = body.authentication ? true : false;
	let hasLoginPage = body.login_bypass ? true : false;
	let waitTime = body.wait_time || 0;

	let fileName = body.fileName || `${randomstring.generate({charset: 'hex'})}.png`;

	return new Promise(async (resolve, reject) => {
		try {
			let defaultHeight = await getHeight(width);
			let browser = await puppeteer.launch({
				executablePath: process.env.EXECUTABLE_PATH,
				defaultViewport: {
					width: width,
					height: defaultHeight
				}
			});
			let page = await browser.newPage();
			// const override = Object.assign(page.viewport(), {
			// 	width: width
			// });
			// await page.setViewport(override);
			if (isAuthenticated) {
				await page.authenticate({
					username: body.authentication.username,
					password: body.authentication.password
				});
			}

			// Bypass login form
			if (hasLoginPage) {
				let loginPageUrl = body.login_bypass.login_page_url.trim(),
					loginId = body.login_bypass.login_id_value.trim(),
					loginPassword = body.login_bypass.login_pass_value,
					idClassname = body.login_bypass.login_id_classname.trim().replace(/\s\s+/g, ' '),
					passClassname = body.login_bypass.login_pass_classname.trim().replace(/\s\s+/g, ' '),
					loginBtn = body.login_bypass.login_btn_classname.trim().replace(/\s\s+/g, ' ');

				await page.goto(loginPageUrl, {
					timeout: 0
				});

				await page.focus(idClassname);
				await page.keyboard.type(loginId);
				await page.focus(passClassname);
				await page.keyboard.type(loginPassword);

				// Preventing the race conditions of the Promise execution
				// Ref: https://github.com/puppeteer/puppeteer/issues/1412#issuecomment-345357063
				await Promise.all([
					page.waitForNavigation(),
					page.click(loginBtn)
				])


				// Wait for page to loaded completely
				// await page.waitForFunction("document.readyState == 'completed'", {
				// 	polling: 100, // 0.1 second
				// 	timeout: 0 // 1 minute
				// });
			}
			await page.goto(url, {
				timeout: 0
			});

			const height = await page.evaluate(_ => {
				return document.body.scrollHeight;
			});
			// await page.evaluate(_ => {
			// 	while (document.body.scrollHeight < (window.scrollY + window.innerHeight)) {
			// 	  window.scrollBy(0, window.innerHeight);
			// 	}
			// });

			// Wait for a specific period before capture
			await new Promise((resolve, reject) => {
				setTimeout(resolve, (parseInt(waitTime) * 10000));
			});

			await page.screenshot({
				path: `./${fileName}`,
				fullPage: true
			});
			// await page.screenshot({ 
			// 	path: `./${fileName}`, 
			// 	clip : { x: 0, y: 0, width:width, height, scale: 1 }
			// });
			await page.close();
			await browser.close();
			resolve(fileName);
		} catch (e) {
			console.log(e);
			reject(e)
		}
	});
}

function getHeight(width) {
	return new Promise(async (resolve, reject) => {
		if (width < 500) {
			resolve(600);
		} else {
			resolve(height = Math.round((width * 9) / 16));
		}
	});
}