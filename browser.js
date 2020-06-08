const puppeteer = require('puppeteer-firefox');
fs = require('fs');

const launchBrowser = async() => {
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
        });
        let data = {'browserWSEndpoint' : browser.wsEndpoint()};
        fs.writeFileSync("browserWSEndpoint.json", JSON.stringify(data));
    }
    catch (err) {
    console.log(err)
    }
};
launchBrowser();
