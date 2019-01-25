const puppeteer = require('puppeteer');
const randomstring = require('randomstring');


module.exports.screenshot =  (body) =>{
    let url = body.url;
    let width = body.width;
    let isAuthenticated = body.authentication ? true : false;
    let fileName = `${randomstring.generate({charset: 'hex'})}.png`;
    let path = body.path;


    return new Promise(async (resolve, reject) => {
        try{
            // console.log("browser open");
            let browser = await puppeteer.launch();
            let page = await browser.newPage();
            const override = Object.assign(page.viewport(), {width: width});
            if(isAuthenticated){
                await page.authenticate({username:body.authentication.username, password:body.authentication.password});
            }
            await page.goto(url, {waitUntil: 'load',timeout: 0});
            await page.setViewport(override);
            await page.screenshot({ path: `./${fileName}`,fullPage: true });
            await page.close();
            await browser.close();
            // console.log("browser close");
            resolve(fileName)
            }catch(e){
                reject(e)
            }
    });
}