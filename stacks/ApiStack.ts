import { Api, Bucket, StackContext, Function } from "sst/constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export function ApiStack({ stack }: StackContext) {

  const layerChromium = new lambda.LayerVersion(stack, "chromiumLayers", {
    code: lambda.Code.fromAsset("layers/chromium"),
  });

  const bucket = new Bucket(stack, "Bucket");

  // Create the HTTP API
  const api = new Api(stack, "Api", {
    routes: {
      "GET /": {
        function: {
          handler: "packages/functions/src/lambda.handler",
          permissions: [bucket],
          bind: [bucket],
        },
      },
      "GET /view-state": {
        function: {
          handler: "packages/functions/src/puppet.handler",
          // Use 18.x here because in 14, 16 layers have some issue with using NODE_PATH
          runtime: "nodejs18.x",
          // Increase the timeout for generating screenshots
          timeout: 15,
          // Increase the memory
          memorySize: "2 GB",
          // Load Chrome in a Layer
          layers: [layerChromium],
          // Exclude bundling it in the Lambda function
          nodejs: {
            esbuild: {
              external: ["@sparticuz/chromium"],
            },
          },
        },
      }
    },
  });

  // Show the API endpoint and the bucket name in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    BucketName: bucket.bucketName,
  });
}
