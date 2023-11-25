// Required module imports for handling emails
const { checkForNewEmails, sendReplyAndLabel } = require("./emailHandler");

/**
 * Processes incoming emails by sending replies and labeling them.
 */
async function processEmails() {
  try {
    // Fetch new emails that require processing
    const threads = await checkForNewEmails();

    // Iterate over each thread and perform necessary actions
    for (let thread of threads) {
      // Send an automated reply to the email and label the thread
      await sendReplyAndLabel(thread.id);
    }
  } catch (error) {
    // Log any errors encountered during the email processing
    console.error("Error processing emails:", error);
  }
}

/**
 * Main function to initiate the email processing at random intervals.
 */
function main() {
  // Define minimum and maximum intervals for email processing
  const minInterval = 45000; // 45 seconds
  const maxInterval = 120000; // 120 seconds

  // Flag to prevent overlapping executions
  let isProcessing = false;

  // Set up an interval to periodically process emails
  setInterval(async () => {
    // Check if processing is already underway to avoid overlaps
    if (!isProcessing) {
      isProcessing = true;

      // Process the emails
      await processEmails();

      // Reset flag after processing is complete
      isProcessing = false;
    }
  }, Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval);
}

// Invoke the main function to start the application
main();
