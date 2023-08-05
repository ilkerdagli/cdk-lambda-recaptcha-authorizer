import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Ilker Dagli',
  authorAddress: 'daglilker@gmail.com',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'cdk-lambda-recaptcha-authorizer',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/ilkerdagli/cdk-lambda-recaptcha-authorizer.git',
  description: 'Custom construct for AWS CDK that provides an easy way to integrate reCAPTCHA-based authorization with Amazon API Gateway.',
  keywords: ['awscdk', 'aws', 'cdk', 'lambda', 'recaptcha', 'authorizer', 'api-gateway'],
  license: 'MIT',
  publishToPypi: {
    distName: 'cdk-lambda-recaptcha-authorizer',
    module: 'cdk_lambda_recaptcha_authorizer',
  },
  stability: 'experimental',
});
project.synth();