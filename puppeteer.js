const puppeteer = require('puppeteer');
const randomstring = require('randomstring');
const fs = require('fs');
// const logger = require('./log')

module.exports.screenshot = (body) => {
	let url = body.url;
	let viewportWidth = body.width;
	let viewportHeight = body.height || getHeight(viewportWidth);
	let isAuthenticated = body.authentication ? true : false;
	let hasLoginPage = body.login_bypass ? true : false;
	let waitTime = body.wait_time || 1;
	let fileName = body.fileName || `${randomstring.generate({charset: 'hex'})}.png`;
	// logger.log.info(`URL: ${url} and Width: ${width} and isAuthenticated: ${isAuthenticated}`);
	return new Promise(async (resolve, reject) => {
		let rawData = fs.readFileSync('browserWSEndpoint.json');
		// let data = JSON.parse(rawData);
		try {
			
			let browser = await puppeteer.launch({
				args: [
					'--disable-gpu',
					'--disable-dev-shm-usage',
					'--disable-setuid-sandbox',
					'--no-first-run',
					'--no-sandbox',
					'--no-zygote',
					'--single-process',
				],
				timeout: 300000,
				defaultViewport: {
					width: viewportWidth,
					height: viewportHeight
				}
			});
			let page = await browser.newPage();
			if (isAuthenticated) {
				// Firefox specific for Basic Authentication
				// Ref: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization
				const encodedCredential = Buffer.from(`${body.authentication.username}:${body.authentication.password}`)
																				.toString('base64');
				await page.setExtraHTTPHeaders({
					Authorization: `Basic ${encodedCredential}`
				})
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

			}
			await page.goto(url, {
				timeout: 0
			});

			const bodyHandle = await page.$('body');
			const { height } = await bodyHandle.boundingBox();

			// Scroll one viewport at a time, pausing to let content load
			let viewportIncr = 0;

			while (viewportIncr + viewportHeight <= height) {
				await page.evaluate(_viewportHeight => {
					window.scrollBy(0, _viewportHeight);
				}, viewportHeight);
				await wait(500);
				viewportIncr = viewportIncr + viewportHeight;
			}

			// Scroll back to top
			await page.evaluate(_ => {
				window.scrollTo(0, 0);
			});

			// Wait for a specific period before capture
			await new Promise((resolve, reject) => {
				setTimeout(resolve, (parseInt(waitTime) * 1000));
			});

			await page.screenshot({
				path: `./${fileName}`,
				fullPage: true
			});

			await page.close();
			await browser.close();
			resolve(fileName);
		} catch (e) {
			// logger.log.error(e);
			reject(e)
		}
	});
}

function getHeight(width) {
	return (width < 500) ? 600 : Math.round((width * 9) / 16);
}
function wait (ms) {
	return new Promise(resolve => setTimeout(() => resolve(), ms));
}