const puppeteer = require('puppeteer-firefox');
const randomstring = require('randomstring');
// const logger = require('./log')

module.exports.screenshot = (body) => {
	let url = body.url;
	let viewportWidth = body.width;
	let viewportHeight = body.height || getHeight(viewportWidth);
	let isAuthenticated = !!body.basicAuth;
	let hasLoginPage = !!body.auth;
	let waitTime = body.captureDelay || 1;
	let fileName = body.fileName || `${randomstring.generate({charset: 'hex'})}.png`;
	// logger.log.info(`URL: ${url} and Width: ${width} and isAuthenticated: ${isAuthenticated}`);
	return new Promise(async (resolve, reject) => {
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
				const encodedCredential = Buffer.from(`${body.basicAuth.username}:${body.basicAuth.password}`)
																				.toString('base64');
				await page.setExtraHTTPHeaders({
					Authorization: `Basic ${encodedCredential}`
				})
			}

			// Bypass login form
			if (hasLoginPage) {
				let loginPageUrl = body.auth.url.trim(),
					loginId = body.auth.username.trim(),
					loginPassword = body.auth.password,
					idClassname = body.auth.usernameSelector.trim().replace(/\s\s+/g, ' '),
					passClassname = body.auth.passwordSelector.trim().replace(/\s\s+/g, ' '),
					loginBtn = body.auth.submitSelector.trim().replace(/\s\s+/g, ' ');

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

			const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

			let siteHeight = (height > scrollHeight) ? height : scrollHeight;

			// Scroll one viewport at a time, pausing to let content load
			let viewportIncr = 0;

			while (viewportIncr + viewportHeight <= siteHeight) {
				await page.evaluate(_viewportHeight => {
					window.scrollBy(0, _viewportHeight);
				}, viewportHeight);
				await wait(500);
				viewportIncr = viewportIncr + viewportHeight;
			}

			await page.addStyleTag({
				content: `
					*,
					*::after,
					*::before {
						transition-delay: 0s !important;
						transition-duration: 0s !important;
						animation-delay: -0.0001s !important;
						animation-duration: 0s !important;
						animation-play-state: paused !important;
						caret-color: transparent !important;
						color-adjust: exact !important;
					}
				`,
			});
			
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