const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function example() {
  let options = new chrome.Options();
  options.setChromeBinaryPath('C:\\Work\\nodeApp\\chrome\\win64-121.0.6167.85\\chrome-win64\\chrome.exe');
  // If running on Heroku or any headless environment, uncomment the next line
  // options.headless();

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    await driver.get('https://www.whalestreetsbetssol.com/');
    // Add your Selenium commands here
  } finally {
    await driver.quit();
  }
})();
