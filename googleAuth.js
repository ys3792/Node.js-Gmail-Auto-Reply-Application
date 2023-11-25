const { google } = require("googleapis");
require("dotenv").config();

/**
 * Initializes OAuth2 client with credentials from environment variables.
 * The OAuth2 client is used to authenticate requests to the Gmail API.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

/**
 * Sets the credentials for the OAuth2 client using the refresh token.
 * The refresh token is stored in an environment variable for security.
 */
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

/**
 * Create an instance of the Gmail API client with the authorized OAuth2 client.
 */
const gmail = google.gmail({ version: "v1", auth: oauth2Client });

module.exports = gmail;
