const express = require("express");
const app = express();

/**
 * Route to handle the OAuth2 redirect.
 * Expects an authorization code as a query parameter.
 */
app.get("/", (req, res) => {
  // Extract the authorization code from query parameters
  const authCode = req.query.code;

  // Check if the authorization code is received
  if (authCode) {
    // Log the authorization code to the console
    console.log(`Authorization code: ${authCode}`);

    // Send a response indicating successful receipt of the code
    res.send("Authorization code received. Check your console.");
  } else {
    // Send a response indicating no code was received
    res.send("No authorization code received.");
  }
});

// Start the server and listen on port 8080
const port = 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
