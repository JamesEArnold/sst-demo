import { ApiHandler } from "sst/node/api";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// This is the path to the local Chromium binary
const YOUR_LOCAL_CHROMIUM_PATH = "/tmp/localChromium/chromium/mac-1287751/chrome-mac/Chromium.app/Contents/MacOS/Chromium";

export const handler = ApiHandler(async (_evt) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: true
      ? YOUR_LOCAL_CHROMIUM_PATH
      : await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();

  // Navigate to the website
  // They spelled the site wrong so this will eventually
  // need to be put back in and the current one deleted
  // await page.goto('https://energychoice.ohio.gov/ApplesToApplesComparison.aspx?Category=Electric&TerritoryId=2&RateCode=1', {
  await page.goto('https://energychoice.ohio.gov/ApplesToApplesComparision.aspx?Category=Electric&TerritoryId=2&RateCode=1', {
    waitUntil: 'networkidle0',
    timeout: 60000 // Wait for 60 seconds
  });

    // Extract the value of the __VIEWSTATE input field
  const viewStateValue = await page.evaluate(() => {
    const viewState = document.querySelector('#__VIEWSTATE');
    const viewStateGenerator = document.querySelector('#__VIEWSTATEGENERATOR');
    const eventValidationCode = document.querySelector('#__EVENTVALIDATION');
    console.log('event: ', eventValidationCode);
    console.log('generator: ', viewStateGenerator);
    if (viewState) {
        return { generator: viewStateGenerator.value, viewState: viewState.value, event: eventValidationCode.value };
    }
    return null; // Return null if no input element found
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ viewStateValue }),
};
});
