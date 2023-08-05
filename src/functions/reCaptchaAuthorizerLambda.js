const https = require("https")
const querystring = require("querystring")

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
