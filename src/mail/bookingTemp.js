const bookingTemp = (data) =>
  ` 
      <html>
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
              background-color: #ffffff;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #1a73e8;
              font-size: 26px;
              margin-bottom: 20px;
              font-weight: bold;
              text-align: center;
            }
            p {
              color: #555555;
              line-height: 1.8;
              font-size: 16px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            table th, table td {
              padding: 12px;
              text-align: left;
              border: 1px solid #ddd;
            }
            table th {
              background-color: #f2f3f8;
              font-weight: bold;
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
            <h1>Booking Confirmation</h1>
            <p>Hello, ${data.name},</p>
            <p>Thank you for booking with <strong>My Tracks</strong>. Here are your booking details:</p>
            
            <table>
              <tr>
                <th>${
                  data.eventName ? data.eventName : data.trackName
                } Name</th>
                <td>${data.eventName ? data.eventName : data.trackName}</td>
              </tr>
              <tr>
                <th>Slot Number</th>
                <td>${data.slotNo}</td>
              </tr>
              <tr>
                <th>Price</th>
                <td>${data.price} ${data.currency}</td>
              </tr>
              <tr>
                <th>Number of People</th>
                <td>${data.numOfPeople}</td>
              </tr>
            </table>
    
            <p>We look forward to serving you. If you have any questions, feel free to contact us at <a href="mailto:mytracksetup@gmail.com">mytracksetup@gmail.com</a>.</p>
            <p>Best regards,<br>The My Tracks Team</p>
          </div>
          <div class="footer">
            <p>&copy; My Tracks - All Rights Reserved.</p>
            <p><a href="https://yourwebsite.com/privacy">Privacy Policy</a> | <a href="https://yourwebsite.com/contact">Contact Support</a></p>
          </div>
        </body>
      </html>
    `;

module.exports = bookingTemp;
