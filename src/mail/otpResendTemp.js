const otpResendTemp = (data) =>
  `<html>
      <head>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f2f3f8;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          }
          h1 {
              color: #1a73e8;
              font-size: 26px;
              margin-bottom: 20px;
              font-weight: bold;
          }
          p {
              color: #555555;
              line-height: 1.8;
              font-size: 16px;
              margin-bottom: 20px;
          }
          .code {
              display: inline-block;
              background-color: #e8f0fe;
              padding: 14px 24px;
              font-size: 20px;
              font-weight: bold;
              color: #1a73e8;
              border-radius: 6px;
              letter-spacing: 2px;
              margin: 20px 0;
          }
          .footer {
              margin-top: 30px;
              font-size: 13px;
              color: #9e9e9e;
              text-align: center;
          }
          .footer p {
              margin: 5px 0;
          }
          a {
              color: #1a73e8;
              text-decoration: none;
          }
      </style>
      </head>
          <body>
              <div class="container">
                  <h1>Hello, ${data.user}</h1>
                  <p>We're sending you this message because you've requested to receive a new OTP code.</p>
                  <p>Your new code is:</p>
                  <p class="code">${
                    data.code ? data.code : data.activationCode
                  }</p>
                  <p>This code will be valid for the next <strong>${
                    data.expiresIn ? data.expiresIn : data.activationCodeExpire
                  } minutes</strong>.</p>
                  <p>If you did not request this code, please disregard this message. For assistance, reach out to us.</p>
                  <p>Thank you,<br>Your My Tracks Team</p>
              </div>
              <div class="footer">
                  <p>&copy; My Tracks - All Rights Reserved.</p>
                  <p>For support, contact us at <a href="mailto:support@company.com">support@company.com</a></p>
              </div>
          </body>
      </html>`;

module.exports = otpResendTemp;
