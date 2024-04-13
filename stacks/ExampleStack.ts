import { Api, Bucket, StackContext, Function } from "sst/constructs";
import { PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam";

export function ExampleStack({ stack }: StackContext) {
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
    },
  });

  // Show the API endpoint and the bucket name in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
    BucketName: bucket.bucketName,
  });
}
