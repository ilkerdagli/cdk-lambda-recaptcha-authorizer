import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { ReCaptchaAuthorizer } from '../src/index';

const mockApp = new App();
const stack = new Stack(mockApp);
const reCaptchaAuthorizer = new ReCaptchaAuthorizer(stack, 'testing-stack', {
  reCaptchaSecretKey: 'RECAPTCHA_SECRET_KEY',
  reCaptchaVersion: 'v2',
});

const api = new apigw.RestApi(stack, 'Api', {
  restApiName: 'Test API',
  description: 'Test API with reCAPTCHA authorizer',
});

const resource = api.root.addResource('test');
resource.addMethod('GET', new apigw.LambdaIntegration(new lambda.Function(stack, 'TestLambda', {
  runtime: lambda.Runtime.NODEJS_14_X,
  handler: 'index.handler',
  code: lambda.Code.fromInline('exports.handler = async () => { return { statusCode: 200, body: "Hello World!" }; };'),
})), {
  authorizer: reCaptchaAuthorizer.authorizer,
  authorizationType: apigw.AuthorizationType.CUSTOM,
});

const template = Template.fromStack(stack);

test('Lambda functions should be configured with properties and execution roles', () => {
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs14.x',
  });

  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
  });
});
test('Lambda functions should have environment variables', () => {
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        RECAPTCHA_SECRET_KEY: 'RECAPTCHA_SECRET_KEY',
        RECAPTCHA_VERSION: 'v2',
      },
    },
  });
});


test('Authorizer should be created with default header name', () => {
  template.hasResourceProperties('AWS::ApiGateway::Authorizer', {
    IdentitySource: 'method.request.header.X-Recaptcha-Response',
  });
});

test('Method should have custom authorization type', () => {
  template.hasResourceProperties('AWS::ApiGateway::Method', {
    AuthorizationType: 'CUSTOM',
  });
});

