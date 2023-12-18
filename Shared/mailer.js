const mail = require('../services/mailer.service')


//To send otp
const otpMail = async (email, verificationCode, username) => {
    const subject = 'email verification'
    const body = `<!DOCTYPE html>
    <html>
      <head>
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            color: #333333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 10px;
          }
          .verification-heading {
            text-align: center;
            color: #aa6c39;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .message {
            text-align: center;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .otp {
            text-align: center;
            font-size: 30px;
            color: #aa6c39;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .instructions {
            font-size: 16px;
            line-height: 1.4;
          }
          .button {
           
            color:#aa6c39;
            
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://drive.google.com/file/d/1zpO-SfrIUlGky2YdT9UCtNdyc_Tu0MLs/view?usp=drive_link" alt="Walkway Logo" width="250" height="250" />
          </div>
          <h1 class="verification-heading">OTP Verification</h1>
          <p class="message">Hi <span class="username">${username}</span>,</p>
          <p class="otp">Your One-Time Password (OTP): <span class="otp-code">${verificationCode}</span></p>
          <div class="instructions">
            <p>
              Thank you for registering on Walkway. Please use the OTP provided above to verify your account.
            </p>
            <p>
              The OTP is valid for a limited time, and it should be used to complete the verification process.
            </p>
            <p>
              If you did not request this OTP, please ignore this email. Your account will remain secure.
            </p>
            <p >
              If you have any questions or need assistance, please don't hesitate to contact our support team at support@walkway.com 
            </p>
          </div>
          <p>Happy modeling and designing!</p>
          <p>Team Walkway</p>
        </div>
      </body>
    </html`;


    await mail.mailService.sendEmail(email,subject,body)
}


//welcome email
const welcomeMail = async (email, username) => {
    const subject = 'welcome email'
    const body = `<!DOCTYPE html>
    <html>
      <head>
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            color: #333333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 10px;
          }
          .verification-heading {
            text-align: center;
            color: #aa6c39;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .message {
            text-align: center;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .otp {
            text-align: center;
            font-size: 30px;
            color: #aa6c39;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .instructions {
            font-size: 16px;
            line-height: 1.4;
          }
          .button {
           
            color:#aa6c39;
            
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://drive.google.com/file/d/1zpO-SfrIUlGky2YdT9UCtNdyc_Tu0MLs/view?usp=drive_link" alt="Walkway Logo" width="250" height="250" />
          </div>
          <h1 class="verification-heading">OTP Verification</h1>
          <p class="message">Hi <span class="username">${username}</span>,</p>
           
          <p> Welcome and thank you for registering with us
          </p>

          </div>
          <p>Happy modeling and designing!</p>
          <p>Team Walkway</p>
        </div>
      </body>
    </html`;


    await mail.mailService.sendEmail(email,subject,body)
}

//send password reset link
const passwordResetLinkMail = async (email, verificationCode, username) => {
    const subject = 'Password reset token'
    const body = `<!DOCTYPE html>
    <html>
      <head>
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            color: #333333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 10px;
          }
          .verification-heading {
            text-align: center;
            color: #aa6c39;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .message {
            text-align: center;
            font-size: 16px;
            margin-bottom: 20px;
          }
          .otp {
            text-align: center;
            font-size: 30px;
            color: #aa6c39;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .instructions {
            font-size: 16px;
            line-height: 1.4;
          }
          .button {
           
            color:#aa6c39;
            
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://drive.google.com/file/d/1zpO-SfrIUlGky2YdT9UCtNdyc_Tu0MLs/view?usp=drive_link" alt="Walkway Logo" width="250" height="250" />
          </div>
          <h1 class="verification-heading">OTP Verification</h1>
          <p class="message">Hi <span class="username">${username}</span>,</p>
          <p class="otp">Your One-Time Password (OTP): <span class="otp-code">${verificationCode}</span></p>
          <div class="instructions">
            <p>
              The password  reset token is valid for a limited time, and it should be used to complete the verification process.
            </p>
            <p>
              If you did not request this password reset token, please ignore this email. Your account will remain secure.
            </p>
            <p >
              If you have any questions or need assistance, please don't hesitate to contact our support team at support@walkway.com 
            </p>
          </div>
          <p>Happy modeling and designing!</p>
          <p>Team Walkway</p>
        </div>
      </body>
    </html`;


    await mail.mailService.sendEmail(email,subject,body)
}      
         
         

module.exports = { 
  otpMail,
   welcomeMail,
   passwordResetLinkMail,
}
