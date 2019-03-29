const puppeteer = require('puppeteer-core');
const randomstring = require('randomstring');


module.exports.screenshot =  (body) =>{
    let url = body.url;
    let width = body.width;
    let isAuthenticated = body.authentication ? true : false;
    let fileName = body.fileName || `${randomstring.generate({charset: 'hex'})}.png`;
    


    return new Promise(async (resolve, reject) => {
        try{
            // console.log("browser open");
            let browser = await puppeteer.launch({executablePath: process.env.EXECUTABLE_PATH});
            let page = await browser.newPage();
            const override = Object.assign(page.viewport(), {width: width});
            await page.setViewport(override);
            if(isAuthenticated){
                await page.authenticate({username:body.authentication.username, password:body.authentication.password});
            }
            await page.goto(url, {waitUntil: 'load',timeout: 0});
            await page.evaluate(_ => {
                while (document.body.scrollHeight < (window.scrollY + window.innerHeight)) {
                  window.scrollBy(0, window.innerHeight);
                }
              });
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