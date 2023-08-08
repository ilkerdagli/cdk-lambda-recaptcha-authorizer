import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { ReCaptchaAuthorizer } from '.';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack');

const api = new apigw.RestApi(stack, 'Api', {
  restApiName: 'API',
  description: 'API with reCAPTCHA authorizer',
});

const authorizer = new ReCaptchaAuthorizer(stack, 'ReCaptchaAuthorizer', {
  reCaptchaSecretKey: 'RECAPTCHA_SECRET_KEY',
  reCaptchaVersion: 'v2',
  // v3MinScoreRequired: 0.5,
  // v3Action: 'login',
  // challangeResponseHeaderName: 'X-Recaptcha-Response',
});

const resource = api.root.addResource('submitForm');

resource.addMethod('POST', new apigw.LambdaIntegration(new lambda.Function(stack, 'Lambda', {
  runtime: lambda.Runtime.NODEJS_14_X,
  handler: 'index.handler',
  code: lambda.Code.fromInline('exports.handler = async () => { return { statusCode: 200, body: "Hello World!" }; };'),
})), {
  authorizer: authorizer,
  authorizationType: apigw.AuthorizationType.CUSTOM,
});

