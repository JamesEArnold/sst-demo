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
  formData.append('__VIEWSTATE', viewstate.viewState);
  formData.append('__VIEWSTATEGENERATOR', viewstate.generator);
  formData.append('__EVENTVALIDATION', viewstate.event);
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
