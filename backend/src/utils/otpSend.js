import AWS from 'aws-sdk';
import sanitizedConfig from '../config.js';

// Initialize SES service object
const ses = new AWS.SES({ region: sanitizedConfig.AWS_REGION});

// Send an email function
export const sendEmail = async (to, subject, body) => {
  const params = {
    Destination: {
      ToAddresses: [to], // To email address
    },
    Message: {
      Body: {
        Text: { Data: body }, // Text email body
      },
      Subject: { Data: subject }, // Email subject
    },
    Source: 'admin@baleryon.in', // The "From" email address (must be verified in SES)
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.log('Error sending email:', error);
    throw error;
  }
};
