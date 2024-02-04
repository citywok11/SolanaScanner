const play = require('play-sound')(opts = {});
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs').promises;

//const url = 'https://thewolfofbonkstreet.site';
// The specific Solana mint address you're looking for
//const tokenAddress = '3AXDzJRsbaibWgUMSxZk32gmajUsbWCokgDDyiinYFPi';

//htmlScraper(url, tokenAddress)

async function htmlScraper(url, tokenAddress) {
    console.log("entered function");
  let options = new chrome.Options();
  options.setChromeBinaryPath('C:\\Work\\nodeApp\\chrome\\win64-121.0.6167.85\\chrome-win64\\chrome.exe');
  // If running on Heroku or any headless environment, uncomment the next line
  options.addArguments("--headless"); // Run in headless mode
  options.addArguments("--disable-gpu"); // Disable GPU hardware acceleration
  options.addArguments("--no-sandbox"); // Disable the sandbox for running Chrome
  options.addArguments("--disable-dev-shm-usage"); // Overcome limited resource problems
  options.addArguments("--remote-debugging-port=9222"); // Specify debugging port
  options.addArguments("--disable-extensions"); // Disable extensions
  options.addArguments("--disable-setuid-sandbox"); // Disable the setuid sandbox
  options.addArguments("--disable-infobars"); // Disable infobars

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

    try {
        await driver.get(url);

        await driver.wait(until.elementLocated(By.tagName('body')), 10000);


        let pageSource = await driver.getPageSource();

        //console.log(pageSource)
      
        // Check if the page source contains the specific address
        if (pageSource.includes(tokenAddress)) {
          console.log('Specific Solana mint address found:', tokenAddress);
          play.play('./notification.wav')
          return true;
        } else {
          console.log('Specific Solana mint address not found.');
          return false;
        }
      } catch (error) {
        console.error('Error processing page source:', error);
      } finally {
        await driver.quit();
      }
      
};

module.exports = { htmlScraper };