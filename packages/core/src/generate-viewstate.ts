import chrome from "chrome-aws-lambda";
import {Browser} from "puppeteer-core";

const puppeteer = chrome.puppeteer;

export async function generate() {
    let browser: Browser;

    try {
        browser = await puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true
        });


        const page = await browser.newPage();
        await page.goto('https://energychoice.ohio.gov/ApplesToApplesComparison.aspx?Category=Electric&TerritoryId=2&RateCode=1');
        await page.waitForSelector('#ctl00_ContentPlaceHolder1_lnkExportToCSV');

        // Click the export button
        await page.click('#ctl00_ContentPlaceHolder1_lnkExportToCSV');
        const response = await page.waitForResponse(response => response.url().includes('some_url_fragment_related_to_download') && response.status() === 200);
        const headers = response.headers();
        const viewState = headers['__VIEWSTATE']; // This is hypothetical; actual key might vary

        // Process or compare __VIEWSTATE here and decide further actions

        return {
            statusCode: 200,
            body: JSON.stringify({ viewState }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: String(error) }),
        };
    }
}
