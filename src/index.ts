import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

// Interface for the ReCaptchaAuthorizerProps
export interface IReCaptchaAuthorizerProps {
  reCaptchaSecretKey: string; // Secret key for ReCaptcha
  reCaptchaVersion: 'v2' | 'v3'; // ReCaptcha version to use, either 'v2' or 'v3'
  v3MinScoreRequired?: number; // (Only for ReCaptcha v3) Minimum score required for successful authorization
  v3Action?: string; // (Only for ReCaptcha v3) Action name for ReCaptcha v3 verification
  challangeResponseHeaderName?: string; // Name of the header containing the ReCaptcha response token
}

// Custom construct class for ReCaptchaAuthorizer
export class ReCaptchaAuthorizer extends Construct {

  readonly authorizer: apigateway.RequestAuthorizer; // The API Gateway RequestAuthorizer

  constructor(scope: Construct, id: string, props: IReCaptchaAuthorizerProps) {
    super(scope, id);

    // Create an AWS Lambda function for the ReCaptcha authorizer
    const authorizerLambda = new lambda.Function(this, 'ReCaptchaAuthorizerLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'reCaptchaAuthorizerLambda.handler', // The handler function in the Lambda code
      code: lambda.Code.fromAsset(path.join(__dirname, '../functions')), // Lambda code asset path
      environment: {
        RECAPTCHA_SECRET_KEY: props.reCaptchaSecretKey, // Set the ReCaptcha secret key as an environment variable
        RECAPTCHA_VERSION: props.reCaptchaVersion, // Set the ReCaptcha version as an environment variable
        RECAPTCHA_V3_MIN_SCORE_REQUIRED: props.v3MinScoreRequired?.toString() || '0.5', // Set the minimum score for ReCaptcha v3 (default: 0.5)
        RECAPTCHA_V3_ACTION: props.v3Action || '', // Set the action name for ReCaptcha v3 (default: empty string)
        CHALLANGE_RESPONSE_HEADER_NAME: props.challangeResponseHeaderName || 'X-Recaptcha-Response', // Set the ReCaptcha response header name (default: 'X-Recaptcha-Response')
      },
    });

    // Create the API Gateway RequestAuthorizer using the Lambda function
    this.authorizer = new apigateway.RequestAuthorizer(this, 'ReCaptchaAuthorizer', {
      handler: authorizerLambda,
      identitySources: [apigateway.IdentitySource.header(props.challangeResponseHeaderName || 'X-Recaptcha-Response')], // Identity source (header) for the ReCaptcha response token
      resultsCacheTtl: cdk.Duration.seconds(0), // Cache TTL for authorizer results (disabled: 0 seconds)
    });

  }
}
