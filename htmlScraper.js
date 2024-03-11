const play = require('play-sound')(opts = {});
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs').promises;
require('./logger'); // This patches console.log

const drivers = []; // This array will hold references to all active WebDriver instances

async function createDriver() {
  let options = new chrome.Options();
  // Include all the necessary Chrome options you had before
  options.addArguments("--headless", "--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage", "--remote-debugging-port=9222", "--disable-extensions", "--disable-setuid-sandbox", "--disable-infobars");
  // Set Chrome binary path if necessary
  options.setChromeBinaryPath('C:\\Work\\nodeApp\\chrome\\win64-121.0.6167.85\\chrome-win64\\chrome.exe');
  
  let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  drivers.push(driver); // Keep track of the driver
  return driver;
}

//const url = 'https://shib.fun/';
// The specific Solana mint address you're looking for
//const tokenAddress = '9whtKG9QJXbFj2Boxp13GrS1mmWCcyhHXiuP8BHQaxrP';

//htmlScraper(url, tokenAddress)

async function htmlScraper(driver, url, tokenAddress) {
    console.log("entered function");

    const websiteData = {
      hasTokenOnWebsite : null,
      hasFunctioningWebsite : null
    }

    try {
        await driver.get(url);

        await driver.wait(until.elementLocated(By.tagName('body')), 5000);

        let pageSource = await driver.getPageSource();

        //console.log(pageSource)
      
        // Check if the page source contains the specific address
        if (pageSource.includes(tokenAddress)) {
          console.log('Specific Solana mint address found:', tokenAddress);
          //play.play('./notification.wav')
          websiteData.hasTokenOnWebsite = true
          websiteData.hasFunctioningWebsite = true;
        } else {
          console.log('Specific Solana mint address not found.');
          websiteData.hasTokenOnWebsite = false
          websiteData.hasFunctioningWebsite = true;
        }
      } catch (error) {
        if(error.name === 'WebDriverError' || error.name === 'InvalidArgumentError') {
          console.log("website doesn't work")
        } else {
        console.error('Error processing page source:', error);
        }
        websiteData.hasTokenOnWebsite = false
        websiteData.hasFunctioningWebsite = false;
      } finally {
        await driver.quit();
        drivers.splice(drivers.indexOf(driver), 1); // Remove the driver from the tracking array
        return websiteData;
      }
      
};

module.exports = { htmlScraper, createDriver };