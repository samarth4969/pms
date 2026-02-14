export function generateForgotPasswordEmailTemplate(resetPasswordUrl){
    return  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #2563eb;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .content {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .btn {
                display: inline-block;
                margin: 20px 0;
                padding: 12px 24px;
                background-color: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .footer {
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #777777;
                background-color: #f4f6f8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>FYP System - Password reset request</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>
                    You requested to reset your password. Click the button below
                    to set a new password.
                </p>

                <a href="${resetPasswordUrl}" class="btn">
                    Reset Password
                </a>

                <p>
                    This link will expire in <strong>15 minutes</strong>.
                    If you did not request a password reset, please ignore this email.
                </p>

                <p>Thanks,<br/>Project Management System Team</p>
            </div>
            <div class="footer">
                <p>
                    If the button does not work, copy and paste this link into your browser:
                </p>
                <p>${resetPasswordUrl}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

//Request Acceptance Email Template
export function generateRequestAcceptedTemplate(teacherName){
    return  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Request Accepted</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #2563eb;  
                color: #ffffff;
                padding: 20px;  
                text-align: center;
            }
            .content {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .footer {
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #777777; 
                background-color: #f4f6f8;
            }
        </style>    
    </head>
    <body>
        <div class="container"> 

            <div class="header">
                <h2>FYP SYSTEM - SUPERVISOR REQUEST ACCEPTED</h2>
            </div>      
            <div class="content">
                <p>Dear Student,</p>
                <p>     
                    We are pleased to inform you that your supervisor request has been accepted by <strong>${teacherName}</strong>.
                </p>
                <p> 
                    You can now proceed to collaborate with your supervisor on your Final Year Project.
                </p>
                <p>
                    Best regards,<br/>
                    Project Management System Team
                </p>
            </div>
            <div class="footer">
                <p>
                    This is an automated message, please do not reply.  
                </p>
                </div>
        </div>
    </body>
    </html>
    `;
}

//Request reject email
export function generateRequestRejectedTemplate(teacherName){
    return  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Request Rejected</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;  
                background: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #2563eb;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }   
            .content {
                padding: 30px;
                color: #333333;
                line-height: 1.6;
            }
            .footer {
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #777777;
                background-color: #f4f6f8;
            }   
        </style>    
    </head>
    <body>
        <div class="container"> 
            <div class="header">
                <h2>FYP SYSTEM - SUPERVISOR REQUEST REJECTED</h2>
            </div>      
            <div class="content">
                <p>Dear Student,</p>
                <p>     
                    We regret to inform you that your supervisor request has been rejected by <strong>${teacherName}</strong>.          
                </p>
                <p> 
                    You may consider reaching out to other faculty members for supervision or consult your academic advisor for further guidance.   
                </p>
                <p>
                    Best regards,<br/>
                    Project Management System Team
                </p>
            </div>  
            <div class="footer">
                <p>
                    This is an automated message, please do not reply.
                </p>
                </div>
        </div>  
    </body>
    </html>
    `;
}


