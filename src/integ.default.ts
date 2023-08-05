import * as cdk from 'aws-cdk-lib';
import { ReCaptchaAuthorizer } from './index';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack');

new ReCaptchaAuthorizer(stack, 'ReCaptchaAuthorizer', {
  reCaptchaSecretKey: 'RECAPTCHA_SECRET_KEY',
  reCaptchaVersion: 'v2',
  // v3MinScoreRequired: 0.5,
  // v3Action: 'login',
  // challangeResponseHeaderName: 'X-Recaptcha-Response',
});

