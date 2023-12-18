// Import the 'nodemailer' library
const nodemailer = require('nodemailer');

// Create a class called 'MailService'
class MailService {
    // Constructor for the 'MailService' class
    constructor() {
        // Create a Nodemailer transporter for sending emails via Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',  // Use the Gmail service
            auth: {
                user: process.env.AUTH_EMAIL,  // Your Gmail email address (from environment variables)
                pass: process.env.AUTH_PASS,   // Your Gmail password (from environment variables)
            },
        });

        // Verify the transporter configuration and log any errors or success
        this.transporter.verify((error, success) => {
            if (error) {
                console.log(error);
            } else {
                console.log(success);
            }
        });
    }

    // Method to send an email
    async sendEmail(email, subject, body) {
        try {
            // Define email options, including sender, recipient, subject, and message body
            const mailOptions = {
                from: process.env.AUTH_EMAIL,  // Sender's email address
                to: email,                      // Recipient's email address
                subject: subject,               // Email subject
                html: body,                     // HTML content of the email
            };

            // Send the email using the transporter
            await this.transporter.sendMail(mailOptions);

            // Return a success response if the email was sent
            return {
                status: 'Pending',
                message: 'Verification token sent',
            };
        } catch (error) {
            // Return an error response if sending the email fails
            return {
                status: 'Failed',
                message: 'Something happened',
            };
        }
    }
}

// Create an instance of the 'MailService' class
const mailService = new MailService();

// Export the 'mailService' instance for use in other parts of your code
module.exports = { mailService };
