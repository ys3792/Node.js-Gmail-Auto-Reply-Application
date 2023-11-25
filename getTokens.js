const { google } = require("googleapis");
require("dotenv").config();

// Define the scope required for the Gmail API.
const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];

// Initialize OAuth2 client with credentials from environment variables.
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

/**
 * Generate an authorization URL and log it to the console.
 * Visit this URL in your browser and complete the OAuth flow.
 */
function getAuthUrl() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);
}

/**
 * Exchange an authorization code for an access token and refresh token.
 * @param {string} code The authorization code received from the OAuth flow.
 */
async function getAccessToken(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Access Token:", tokens.access_token);
    console.log("Refresh Token:", tokens.refresh_token);
  } catch (error) {
    console.error("Error retrieving access token:", error);
  }
}

// Generate and display the authorization URL.
getAuthUrl();

getAccessToken(
  "4/0AfJohXnQU3q31pCcNM3eJfzqITA7--u2dW1VCUJiT6SOW64LP7mhbPsx6tAEk219Q23Law"
);
