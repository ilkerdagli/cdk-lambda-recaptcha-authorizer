const https = require("https")
const querystring = require("querystring")

exports.handler = async (event) => {
  try {
    console.log("reCAPTCHA authorizer event:", event)
    const { methodArn, headers } = event
    const reCaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY
    const reCaptchaVersion = process.env.RECAPTCHA_VERSION
    const reCaptchaV3MinScoreRequired =
      process.env.RECAPTCHA_V3_MIN_SCORE_REQUIRED
    const reCaptchaV3Action = process.env.RECAPTCHA_V3_ACTION
    const challangeResponseHeaderName =
      process.env.CHALLANGE_RESPONSE_HEADER_NAME

    if (!reCaptchaSecretKey || !reCaptchaVersion) {
      throw new Error(
        "RECAPTCHA_SECRET_KEY and RECAPTCHA_VERSION must be provided in the environment."
      )
    }

    if (!headers) {
      throw new Error("No reCAPTCHA token found in the request.")
    }

    const userResponseToken =
      headers[challangeResponseHeaderName] ||
      headers[challangeResponseHeaderName.toLowerCase()]

    if (userResponseToken) {
      let response
      if (reCaptchaVersion === "v2" || reCaptchaVersion === "v3") {
        response = await verifyReCaptcha(userResponseToken, reCaptchaSecretKey)
        if (reCaptchaVersion === "v3") {
          if (
            response.score < parseFloat(reCaptchaV3MinScoreRequired || "0.5")
          ) {
            console.error("reCAPTCHA verification failed:", response)
            throw new Error("Unauthorized")
          }
          if (reCaptchaV3Action && response.action !== reCaptchaV3Action) {
            console.error("reCAPTCHA verification failed:", response)
            throw new Error("Unauthorized")
          }
        }
      } else {
        throw new Error(
          'Invalid reCAPTCHA version. Supported versions are "v2" and "v3".'
        )
      }

      if (response.success) {
        const policyDocument = {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Allow",
              Resource: methodArn,
            },
          ],
        }
        const authResponse = {
          principalId: "user",
          policyDocument,
        }
        return authResponse
      } else {
        console.error("reCAPTCHA verification failed:", response)
        throw new Error("Unauthorized")
      }
    } else {
      console.log("No reCAPTCHA token found in the request.")
      throw new Error("Unauthorized")
    }
  } catch (error) {
    console.error("Error occurred during reCAPTCHA verification:", error)
    throw new Error("Unauthorized")
  }
}

// Function to verify the ReCaptcha token with Google's API
async function verifyReCaptcha(userResponseToken, secretKey) {
  return new Promise((resolve, reject) => {
    // Prepare the data to be sent in the POST request
    const postData = querystring.stringify({
      secret: secretKey, // ReCaptcha secret key
      response: userResponseToken, // User's ReCaptcha token
    })

    // Set up the options for the HTTPS POST request
    const options = {
      hostname: "www.google.com",
      port: 443,
      path: "/recaptcha/api/siteverify",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
      },
    }

    // Make the HTTPS POST request to Google's ReCaptcha API
    const req = https.request(options, (res) => {
      let data = ""

      // Collect the response data
      res.on("data", (chunk) => {
        data += chunk
      })

      // Process the response after it has been received
      res.on("end", () => {
        try {
          const response = JSON.parse(data)
          resolve(response) // Resolve the promise with the ReCaptcha API response
        } catch (err) {
          reject(err) // Reject the promise if JSON parsing or other errors occur
        }
      })
    })

    // Handle errors with the HTTPS request
    req.on("error", (err) => {
      reject(err) // Reject the promise if an error occurs during the HTTPS request
    })

    // Write the POST data and end the request
    req.write(postData)
    req.end()
  })
}
