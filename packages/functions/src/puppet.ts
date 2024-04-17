import { ApiHandler } from "sst/node/api";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { createHash } from 'crypto';
import { S3Client, PutObjectCommand, S3, GetObjectCommand } from "@aws-sdk/client-s3";


const s3 = new S3({});
const s3Client = new S3Client({});

// This is the path to the local Chromium binary
const YOUR_LOCAL_CHROMIUM_PATH = "/tmp/localChromium/chromium/mac-1287751/chrome-mac/Chromium.app/Contents/MacOS/Chromium";

const BUCKET_NAME = 'james-rest-api-apistack-bucketd7feb781-gxivyvk8z99n';
const OBJECT_KEY = 'current-data-hash';

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

const stepLogs = {};

async function getStoredHashFromS3(): Promise<string | undefined> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY,
    });

    const response = await s3Client.send(command);

      return await response.Body?.transformToString() || '';
    } catch (error) {
      console.log('Error retrieving hash from S3:', error);
      return undefined;
  }
}

async function saveHashToS3(hash: string): Promise<void> {
  await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: OBJECT_KEY,
      Body: hash
  });
}

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

  const currentHash = computeHash(JSON.stringify(viewStateValue, Object.keys(viewStateValue || {}).sort()));
  const storedHash = await getStoredHashFromS3();

  // console.log('Current Data:', JSON.stringify(viewStateValue, null, 2));
  console.log('Current Hash:', currentHash);
  console.log('Stored Hash:', JSON.stringify(storedHash));


  if (currentHash === storedHash) {
    console.log('No changes detected.');
    return {
      statusCode: 200,
      body: 'No changes detected',
    }
  }

  console.log('Changes detected, updating hash and processing data...');
  await saveHashToS3(currentHash);

  return {
    statusCode: 200,
    body: JSON.stringify({ viewStateValue }),
  };
});
