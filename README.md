# ReCaptcha Authorizer for AWS CDK
This is an AWS CDK construct that provides an easy way to add ReCaptcha-based authorization 
to your API Gateway endpoints. It uses Google's ReCaptcha API to verify user responses and 
secure your API resources.

## Installation
To use this construct in your AWS CDK projects, you can install it from npm:
```bash
npm install cdk-lambda-recaptcha-authorizer
```

## Example Usage
Here's an example of how to use the `ReCaptchaAuthorizer` construct in your AWS CDK stack:
```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { ReCaptchaAuthorizer } from 'cdk-lambda-recaptcha-authorizer';

export class LraExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const challangeResponseHeaderName = 'X-My-Header'

    const api = new apigw.RestApi(this, 'Api', {
      restApiName: 'API',
      description: 'API with reCAPTCHA authorizer',
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          challangeResponseHeaderName
        ],
        allowCredentials: true,
        allowOrigins: ['*'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      }
    });

    const reCaptchaAuthorizer = new ReCaptchaAuthorizer(this, 'ReCaptchaAuthorizer', {
      reCaptchaSecretKey: 'YOUR-RECAPTCHA-SECRET-KEY',
      reCaptchaVersion: 'v2',
      challangeResponseHeaderName: challangeResponseHeaderName
    })

    const resource = api.root.addResource('submitForm');

    resource.addMethod('POST', new apigw.LambdaIntegration(new lambda.Function(this, 'Lambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => { return { statusCode: 200, body: "Hello World!" }; };'),
    })), {

      authorizer: reCaptchaAuthorizer.authorizer,
      authorizationType: apigw.AuthorizationType.CUSTOM,
    });
  }
}
```
Here's an example form in html that sends recaptcha challange response in header:
```html
<!DOCTYPE html>
<html>
   <head>
      <title>reCAPTCHA v2 Demo</title>
      <script src="https://www.google.com/recaptcha/api.js" async defer></script>
   </head>
   <body>
      <h1>reCAPTCHA v2 Demo Form</h1>
      <form
         id="demoForm"
         method="POST"
         >
         <label for="name">Name:</label>
         <input type="text" id="name" name="name" required />
         <br />
         <div class="g-recaptcha" data-sitekey="YOUR-RECAPTCHA-SITE-KEY"></div>
         <button type="submit">Submit</button>
      </form>
      <script>
         const form = document.getElementById("demoForm")
         
         form.addEventListener("submit", async (event) => {
           event.preventDefault()
           const recaptchaResponse = grecaptcha.getResponse()
         
           if (recaptchaResponse === "") {
             alert("Please complete the reCAPTCHA verification.")
             return
           }
         
           const headers = new Headers()
           headers.append("X-My-Header", recaptchaResponse)
         
           const response = await fetch("YOUR-API-GATEWAY-URL", {
             method: "POST",
             headers: headers,
             body: new FormData(form),
           })
         
           if (response.ok) {
             alert("Form submitted successfully!")
           } else {
             alert("Form submission failed. Please try again later.")
           }
         })
      </script>
   </body>
</html>
```


## Configuration
The `ReCaptchaAuthorizer` accepts the following configuration options:

- `reCaptchaSecretKey`: Your ReCaptcha secret key. It is required.
- `reCaptchaVersion`: The ReCaptcha version to use. It can be either 'v2' or 'v3'.
- `v3MinScoreRequired`: (Optional) The minimum score required for ReCaptcha v3 authorization. Default is 0.5.
- `v3Action`: (Optional) Specify a custom action name for ReCaptcha v3 authorization.
- `challangeResponseHeaderName`: (Optional) The name of the header containing the 
ReCaptcha response token. Default is 'X-Recaptcha-Response'.

The `reCaptchaSecretKey` and `reCaptchaVersion` are mandatory parameters, as they are essential 
for the ReCaptcha verification process. If you don't provide these values, an error will be thrown.

For ReCaptcha v3, you can optionally set the `v3MinScoreRequired` parameter to specify the minimum 
score required for authorization. The default value is 0.5, but you can adjust it as needed.

If you are using ReCaptcha v3 and have defined specific actions in your ReCaptcha settings, 
you can use the `v3Action` parameter to specify the expected action name for the request. 
If the action name doesn't match the one provided, the verification will fail.

Additionally, you can customize the header name used to send the ReCaptcha token 
with the `challangeResponseHeaderName` parameter. The default header name is 'X-Recaptcha-Response', 
but you can use a custom name if needed.

Keep in mind that these configuration options should be provided when creating the `ReCaptchaAuthorizer` 
instance to ensure proper functioning and security of your API endpoints.

## How It Works
The `ReCaptchaAuthorizer` construct creates an AWS Lambda function that handles the ReCaptcha verification. 
It sends the ReCaptcha token to Google's ReCaptcha API using an HTTPS POST request and verifies 
the user's response. If the verification is successful, the authorizer allows the request to proceed 
and grants access to the associated API Gateway resource.

Here's a high-level overview of the process:

1. When a client makes a request to an API Gateway endpoint protected by the `ReCaptchaAuthorizer`, 
it includes a ReCaptcha token in the request headers.

2. The `ReCaptchaAuthorizer` Lambda function receives the request and extracts the ReCaptcha 
token from the headers.

3. The Lambda function then sends an HTTPS POST request to Google's ReCaptcha API with the 
ReCaptcha token and your ReCaptcha secret key.

4. Google's ReCaptcha API verifies the token and sends back a response indicating whether 
the token is valid or not.

5. If the ReCaptcha token is valid, the Lambda function allows the request to proceed 
and grants access to the API Gateway resource.

6. If the ReCaptcha token is invalid or the verification fails, the Lambda function 
denies access to the API Gateway resource and returns an unauthorized response.
