import axios from "axios";
import FormData from "form-data";
import viewstate from "@rest-api/core/viewstate";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Handler } from "aws-lambda";
import { Bucket } from "sst/node/bucket";

const S3 = new S3Client({});
const downloadUrl = 'https://energychoice.ohio.gov/ApplesToApplesComparision.aspx?Category=Electric&TerritoryId=2&RateCode=1';

export const handler: S3Handler = async (event) => {

  const formData = new FormData();
  formData.append('__EVENTTARGET', 'ctl00$ContentPlaceHolder1$lnkExportToCSV');
  formData.append('__EVENTARGUMENT', '');
  formData.append('__VIEWSTATE', viewstate);
  formData.append('__VIEWSTATEGENERATOR', 'E452194D');
  formData.append('__EVENTVALIDATION', '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');
  formData.append('ctl00$ContentPlaceHolder1$hdnIntroductoryPrice', '');
  formData.append('ctl00$ContentPlaceHolder1$hdnPromotionalOffer', '');
  formData.append('ctl00$ContentPlaceHolder1$hdnRateType', '');
  formData.append('ctl00$ContentPlaceHolder1$txtCurrentRate', '');
  formData.append('ctl00$ContentPlaceHolder1$txtPriceFrom', '');
  formData.append('ctl00$ContentPlaceHolder1$txtPriceTo', '');
  formData.append('ctl00$ContentPlaceHolder1$txtTermLengthFrom', '');
  formData.append('ctl00$ContentPlaceHolder1$txtTermLengthTo', '');
  formData.append('ctl00$ContentPlaceHolder1$txtEarlyTerminationFeeFrom', '');
  formData.append('ctl00$ContentPlaceHolder1$txtEarlyTerminationFeeTo', '');
  formData.append('ctl00$ContentPlaceHolder1$txtMonthlyFeeFrom', '');
  formData.append('ctl00$ContentPlaceHolder1$txtMonthlyFeeTo', '');
  formData.append('ctl00$ContentPlaceHolder1$ddlRenewableContent', '');
  formData.append('ctl00$ContentPlaceHolder1$ddlRateTypeFilter', '');
  formData.append('ctl00$ContentPlaceHolder1$ddlCompany', '');

  const config = {
    method: 'post',
    url: downloadUrl,
    headers: { 
        ...formData.getHeaders()
    },
    data : formData,
  };  


  const response = await axios(config);

  const key = `${new Date().valueOf().toString()}.txt`;

  const command = new PutObjectCommand({
    Body: response.data,
    Bucket: Bucket.Bucket.bucketName,
    Key: key,
  });


  try {
    // Wait for the file to upload
    await S3.send(command);
  } catch (err) {
    console.log(err);
  }
};
