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

export class ExampleRecaptchaAuthorizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, 'Api', {
      restApiName: 'API',
      description: 'API with reCAPTCHA authorizer',
    });

    // Create the ReCaptchaAuthorizer and provide your ReCaptcha secret key
    const reCaptchaAuthorizer = new ReCaptchaAuthorizer(this, 'ReCaptchaAuthorizer', {
      reCaptchaSecretKey: 'YOUR_RECAPTCHA_SECRET_KEY',
      reCaptchaVersion: 'v2', // Use 'v2' or 'v3'
      // v3MinScoreRequired?: 0.5, // (Optional) Minimum score required for ReCaptcha v3
      // v3Action?: 'your_custom_action', // (Optional) Specify a custom action for ReCaptcha v3
      // challangeResponseHeaderName?: 'X-Recaptcha-Response', // (Optional) Custom header name for ReCaptcha token
    });

    // Create an API Gateway resource and associate the ReCaptchaAuthorizer with it
    const resource = api.root.addResource('hello');
    resource.addMethod('GET', new apigw.LambdaIntegration(new lambda.Function(this, 'Lambda', {
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

# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ReCaptchaAuthorizer <a name="ReCaptchaAuthorizer" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer"></a>

#### Initializers <a name="Initializers" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.Initializer"></a>

```typescript
import { ReCaptchaAuthorizer } from 'cdk-lambda-recaptcha-authorizer'

new ReCaptchaAuthorizer(scope: Construct, id: string, props: IReCaptchaAuthorizerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps">IReCaptchaAuthorizerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps">IReCaptchaAuthorizerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.isConstruct"></a>

```typescript
import { ReCaptchaAuthorizer } from 'cdk-lambda-recaptcha-authorizer'

ReCaptchaAuthorizer.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.property.authorizer">authorizer</a></code> | <code>aws-cdk-lib.aws_apigateway.RequestAuthorizer</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `authorizer`<sup>Required</sup> <a name="authorizer" id="cdk-lambda-recaptcha-authorizer.ReCaptchaAuthorizer.property.authorizer"></a>

```typescript
public readonly authorizer: RequestAuthorizer;
```

- *Type:* aws-cdk-lib.aws_apigateway.RequestAuthorizer

---




## Protocols <a name="Protocols" id="Protocols"></a>

### IReCaptchaAuthorizerProps <a name="IReCaptchaAuthorizerProps" id="cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps"></a>

- *Implemented By:* <a href="#cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps">IReCaptchaAuthorizerProps</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.reCaptchaSecretKey">reCaptchaSecretKey</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.reCaptchaVersion">reCaptchaVersion</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.challangeResponseHeaderName">challangeResponseHeaderName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.v3Action">v3Action</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.v3MinScoreRequired">v3MinScoreRequired</a></code> | <code>number</code> | *No description.* |

---

##### `reCaptchaSecretKey`<sup>Required</sup> <a name="reCaptchaSecretKey" id="cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.reCaptchaSecretKey"></a>

```typescript
public readonly reCaptchaSecretKey: string;
```

- *Type:* string

---

##### `reCaptchaVersion`<sup>Required</sup> <a name="reCaptchaVersion" id="cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.reCaptchaVersion"></a>

```typescript
public readonly reCaptchaVersion: string;
```

- *Type:* string

---

##### `challangeResponseHeaderName`<sup>Optional</sup> <a name="challangeResponseHeaderName" id="cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.challangeResponseHeaderName"></a>

```typescript
public readonly challangeResponseHeaderName: string;
```

- *Type:* string

---

##### `v3Action`<sup>Optional</sup> <a name="v3Action" id="cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.v3Action"></a>

```typescript
public readonly v3Action: string;
```

- *Type:* string

---

##### `v3MinScoreRequired`<sup>Optional</sup> <a name="v3MinScoreRequired" id="cdk-lambda-recaptcha-authorizer.IReCaptchaAuthorizerProps.property.v3MinScoreRequired"></a>

```typescript
public readonly v3MinScoreRequired: number;
```

- *Type:* number

---

