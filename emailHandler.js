const gmail = require("./googleAuth");

// Email address used by the application for sending auto-replies.
const MY_EMAIL_ADDRESS = "placementinternship2024@gmail.com";

/**
 * Retrieves email threads from the Gmail inbox that have not yet been replied to.
 * Threads already labeled as 'AutoReplied' are excluded to prevent multiple responses.
 *
 * @returns {Promise<Array>} Promise resolving to an array of unreplied email threads.
 */
async function checkForNewEmails() {
  try {
    // Fetch threads from the inbox excluding those already replied.
    const response = await gmail.users.threads.list({
      userId: "me",
      labelIds: ["INBOX"],
      q: "-label:AutoReplied",
    });

    // Filter out threads to which replies have already been sent.
    const threads = response.data.threads || [];
    const unrepliedThreads = await filterUnrepliedThreads(threads);

    return unrepliedThreads;
  } catch (error) {
    console.error("Error in checkForNewEmails:", error);
    return [];
  }
}

/**
 * Filters out threads from a list that have already been replied to.
 *
 * @param {Array} threads - Array of email threads.
 * @returns {Promise<Array>} Promise resolving to an array of threads that haven't been replied.
 */
async function filterUnrepliedThreads(threads) {
  const unrepliedThreads = [];

  for (let thread of threads) {
    const threadDetails = await gmail.users.threads.get({
      userId: "me",
      id: thread.id,
    });

    const hasBeenReplied = threadDetails.data.messages.some(
      (message) =>
        message.labelIds &&
        message.labelIds.includes("SENT") &&
        message.labelIds.includes("INBOX")
    );

    if (!hasBeenReplied) {
      unrepliedThreads.push(thread);
    }
  }

  return unrepliedThreads;
}

/**
 * Processes an email thread by sending an auto-reply and then labeling the thread.
 *
 * @param {string} threadId - The ID of the email thread to process.
 */
async function sendReplyAndLabel(threadId) {
  try {
    await sendReply(threadId);
    await labelAndOrganizeEmail(threadId);
  } catch (error) {
    console.error("Error in sendReplyAndLabel:", error);
  }
}

/**
 * Sends an auto-reply to the sender of the latest message in an email thread.
 * Skips sending a reply if the sender is the application itself to avoid loops.
 *
 * @param {string} threadId - The ID of the email thread.
 */
async function sendReply(threadId) {
  try {
    const thread = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
    });
    const messages = thread.data.messages;
    const lastMessage = messages[messages.length - 1];
    const fromHeader = lastMessage.payload.headers.find(
      (header) => header.name === "From"
    );
    const senderEmail = extractEmailAddress(fromHeader.value);

    if (senderEmail === MY_EMAIL_ADDRESS) {
      return;
    }

    // Prepare and send the auto-reply message.
    const subject = "Auto Reply: Out of Office";
    const messageBody =
      "I am currently out of the office. Will get back to you soon.";
    const encodedMessage = Buffer.from(
      `Content-Type: text/plain; charset="UTF-8"\nMIME-Version: 1.0\nContent-Transfer-Encoding: 7bit\nto: ${senderEmail}\nsubject: ${subject}\n\n${messageBody}`
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });
  } catch (error) {
    console.error("Error in sendReply:", error);
  }
}

/**
 * Labels an email thread to indicate that a reply has been sent.
 *
 * @param {string} threadId - The ID of the email thread to be labeled.
 */
async function labelAndOrganizeEmail(threadId) {
  try {
    const labelName = "AutoReplied";
    let label = await findOrCreateLabel(labelName);

    // Apply the label to the thread.
    await gmail.users.threads.modify({
      userId: "me",
      id: threadId,
      requestBody: {
        addLabelIds: [label.id],
      },
    });
  } catch (error) {
    console.error("Error in labelAndOrganizeEmail:", error);
  }
}

/**
 * Finds an existing label by its name or creates a new one if it does not exist.
 *
 * @param {string} name - The name of the label to find or create.
 * @returns {Promise<Object>} Promise resolving to the label object.
 */
async function findOrCreateLabel(name) {
  try {
    const existingLabels = await gmail.users.labels.list({ userId: "me" });
    const foundLabel = existingLabels.data.labels.find(
      (label) => label.name === name
    );

    if (!foundLabel) {
      const newLabel = await gmail.users.labels.create({
        userId: "me",
        requestBody: { name },
      });
      return newLabel.data;
    }

    return foundLabel;
  } catch (error) {
    console.error("Error in findOrCreateLabel:", error);
    return null;
  }
}

/**
 * Extracts an email address from a header string.
 *
 * @param {string} headerValue - The string containing the header information.
 * @returns {string|null} The extracted email address, or null if not found.
 */
function extractEmailAddress(headerValue) {
  const matches = headerValue.match(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  );
  return matches ? matches[0] : null;
}

module.exports = {
  checkForNewEmails,
  sendReplyAndLabel,
  labelAndOrganizeEmail,
};
