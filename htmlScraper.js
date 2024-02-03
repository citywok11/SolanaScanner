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
  options.addArguments('--headless'); // Enables headless mode
  options.addArguments('--disable-gpu'); // Disables GPU hardware acceleration. If software renderer is not in place, then the GPU process won't launch.
  options.addArguments('--window-size=1920,1080'); // Specifies the window size

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