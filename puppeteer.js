const puppeteer = require('puppeteer-core');
const randomstring = require('randomstring');


module.exports.screenshot =  (body) =>{
	let url = body.url;
	let width = body.width;
	let isAuthenticated = body.authentication ? true : false;
	let hasLoginPage = body.login_bypass ? true : false;
	
	let fileName = body.fileName || `${randomstring.generate({charset: 'hex'})}.png`;
	
	return new Promise(async (resolve, reject) => {
		try{
			console.log(body);
			let browser = await puppeteer.launch({
				executablePath: process.env.EXECUTABLE_PATH
			});
			let page = await browser.newPage();
			const override = Object.assign(page.viewport(), {
				width: width
			});

			if(isAuthenticated){
				await page.authenticate({
					username: body.authentication.username, 
					password: body.authentication.password
				});
			}
			
			// Bypass login form
			if(hasLoginPage) {
				let loginPageUrl = body.login_bypass.login_page_url.trim(),
					loginId = body.login_bypass.login_id_value.trim(),
					loginPassword = body.login_bypass.login_pass_value,
					idClassname = body.login_bypass.login_id_classname.trim().replace(/\s\s+/g, ' '),
					passClassname = body.login_bypass.login_pass_classname.trim().replace(/\s\s+/g, ' '),
					loginBtn = body.login_bypass.login_btn_classname.trim().replace(/\s\s+/g, ' ');

				await page.goto(loginPageUrl, {
					waitUntil: 'load',
					timeout: 0
				});
				await page.click(`${idClassname}`);
				await page.keyboard.type(loginId);
				await page.click(`${passClassname}`);
				await page.keyboard.type(loginPassword);
				await page.click(`${loginBtn}`);
				await page.waitForNavigation({
					waitUntil: 'domcontentloaded',
					timeout: 0
				});
				
				
				// Wait for page to loaded completely
				// await page.waitForFunction("document.readyState == 'completed'", {
				// 	polling: 100, // 0.1 second
				// 	timeout: 0 // 1 minute
				// });
			}
			await page.goto(url, {
				waitUntil: 'load',
				timeout: 0
			});
			await page.evaluate(_ => {
				while (document.body.scrollHeight < (window.scrollY + window.innerHeight)) {
				  window.scrollBy(0, window.innerHeight);
				}
			});
			await page.screenshot({
				path: `./${fileName}`,
				fullPage: true
			});
			await page.close();
			await browser.close();
			resolve(fileName);
		}catch(e){
			console.log(e);
			reject(e)
		}
	});
}