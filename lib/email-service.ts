import nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter(emailConfig)
}

// Email templates
const emailTemplates = {
  registrationConfirmation: (data: any) => ({
    subject: `✅ Registration Confirmed: ${data.eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2D8EFF 0%, #1e6bb8 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e1e1e1; }
          .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2D8EFF; }
          .button { display: inline-block; background: #2D8EFF; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
          .status-badge { background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Registration Confirmed!</h1>
          <p>You're all set for this amazing event</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.attendeeName},</h2>
          
          <p>Great news! Your registration for <strong>${data.eventTitle}</strong> has been confirmed.</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${data.eventTime}</p>
            <p><strong>Duration:</strong> ${data.eventDuration}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
            <p><strong>Category:</strong> ${data.eventCategory}</p>
            <p><strong>Status:</strong> <span class="status-badge">REGISTERED</span></p>
          </div>
          
          ${data.eventPrerequisites && data.eventPrerequisites.length > 0 ? `
          <div class="event-details">
            <h3>📋 Prerequisites</h3>
            <ul>
              ${data.eventPrerequisites.map((req: string) => `<li>${req}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          ${data.eventLearning && data.eventLearning.length > 0 ? `
          <div class="event-details">
            <h3>🎯 What You'll Learn</h3>
            <ul>
              ${data.eventLearning.map((item: string) => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          <p>We're excited to have you join us! Make sure to arrive a few minutes early and bring any materials mentioned in the prerequisites.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/events" class="button">View Event Details</a>
          
          <h3>Need to make changes?</h3>
          <p>If you need to cancel your registration, you can do so through your dashboard or by replying to this email.</p>
        </div>
        
        <div class="footer">
          <p><strong>Blackbird Portal Events</strong></p>
          <p>Immersive technology events and collaborative learning experiences</p>
          <p>This is an automated message. Please don't reply directly to this email.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Registration Confirmed: ${data.eventTitle}

Hello ${data.attendeeName},

Your registration for ${data.eventTitle} has been confirmed!

Event Details:
- Date: ${new Date(data.eventDate).toLocaleDateString()}
- Time: ${data.eventTime}
- Location: ${data.eventLocation}
- Duration: ${data.eventDuration}

We're excited to have you join us!

Best regards,
Blackbird Portal Events Team
    `
  }),

  waitlistConfirmation: (data: any) => ({
    subject: `⏳ You're on the Waitlist: ${data.eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Waitlist Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF8C00 0%, #FF6347 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e1e1e1; }
          .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF8C00; }
          .button { display: inline-block; background: #FF8C00; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
          .status-badge { background: #ffc107; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏳ You're on the Waitlist!</h1>
          <p>We'll notify you if a spot opens up</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.attendeeName},</h2>
          
          <p>Thank you for your interest in <strong>${data.eventTitle}</strong>! While the event is currently full, we've added you to the waitlist.</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${data.eventTime}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
            <p><strong>Status:</strong> <span class="status-badge">WAITLISTED</span></p>
            <p><strong>Waitlist Position:</strong> We'll contact you if a spot becomes available</p>
          </div>
          
          <h3>What happens next?</h3>
          <p>If someone cancels their registration, we'll automatically move you from the waitlist to confirmed registration. You'll receive an email notification immediately.</p>
          
          <p>We recommend keeping this date free in your calendar just in case!</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/events" class="button">View All Events</a>
        </div>
        
        <div class="footer">
          <p><strong>Blackbird Portal Events</strong></p>
          <p>Immersive technology events and collaborative learning experiences</p>
        </div>
      </body>
      </html>
    `,
    text: `
You're on the Waitlist: ${data.eventTitle}

Hello ${data.attendeeName},

Thank you for your interest in ${data.eventTitle}! The event is currently full, but we've added you to the waitlist.

Event Details:
- Date: ${new Date(data.eventDate).toLocaleDateString()}
- Time: ${data.eventTime}
- Location: ${data.eventLocation}

We'll notify you immediately if a spot becomes available.

Best regards,
Blackbird Portal Events Team
    `
  }),

  promotionFromWaitlist: (data: any) => ({
    subject: `🎉 Great News! You're now registered for ${data.eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Promoted from Waitlist</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e1e1e1; }
          .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .button { display: inline-block; background: #28a745; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
          .status-badge { background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Fantastic News!</h1>
          <p>A spot opened up and you're now registered!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.attendeeName},</h2>
          
          <p><strong>Exciting update!</strong> A spot has become available for <strong>${data.eventTitle}</strong> and we've automatically confirmed your registration.</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${data.eventTime}</p>
            <p><strong>Duration:</strong> ${data.eventDuration}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
            <p><strong>Status:</strong> <span class="status-badge">CONFIRMED</span></p>
          </div>
          
          <p>🎯 <strong>Action Required:</strong> Please confirm your attendance by clicking the button below. If you can no longer attend, please cancel as soon as possible so we can offer the spot to someone else on the waitlist.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/events" class="button">Confirm Attendance</a>
          
          <p>We're thrilled to have you join us for this event!</p>
        </div>
        
        <div class="footer">
          <p><strong>Blackbird Portal Events</strong></p>
          <p>Immersive technology events and collaborative learning experiences</p>
        </div>
      </body>
      </html>
    `,
    text: `
Great News! You're now registered for ${data.eventTitle}

Hello ${data.attendeeName},

A spot has become available and we've automatically confirmed your registration for ${data.eventTitle}!

Event Details:
- Date: ${new Date(data.eventDate).toLocaleDateString()}
- Time: ${data.eventTime}
- Location: ${data.eventLocation}
- Duration: ${data.eventDuration}

Please confirm your attendance or cancel if you can no longer attend.

Best regards,
Blackbird Portal Events Team
    `
  }),

  eventReminder: (data: any) => ({
    subject: `⏰ Reminder: ${data.eventTitle} is tomorrow!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Reminder</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e1e1e1; }
          .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1; }
          .button { display: inline-block; background: #6f42c1; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Event Tomorrow!</h1>
          <p>Don't forget about your upcoming event</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.attendeeName},</h2>
          
          <p>This is a friendly reminder that you're registered for <strong>${data.eventTitle}</strong> tomorrow!</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${data.eventTime}</p>
            <p><strong>Duration:</strong> ${data.eventDuration}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
          </div>
          
          <div class="highlight">
            <h3>📝 Before You Attend</h3>
            <ul>
              <li>Arrive 10-15 minutes early for check-in</li>
              <li>Bring a notepad and pen for taking notes</li>
              <li>Review the prerequisites if you haven't already</li>
              <li>Bring your enthusiasm and questions!</li>
            </ul>
          </div>
          
          ${data.eventPrerequisites && data.eventPrerequisites.length > 0 ? `
          <div class="event-details">
            <h3>📋 Prerequisites Reminder</h3>
            <ul>
              ${data.eventPrerequisites.map((req: string) => `<li>${req}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          <p>If you can no longer attend, please cancel your registration as soon as possible so we can offer your spot to someone on the waitlist.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/events" class="button">View Event Details</a>
          
          <p>We're looking forward to seeing you tomorrow!</p>
        </div>
        
        <div class="footer">
          <p><strong>Blackbird Portal Events</strong></p>
          <p>Immersive technology events and collaborative learning experiences</p>
        </div>
      </body>
      </html>
    `,
    text: `
Reminder: ${data.eventTitle} is tomorrow!

Hello ${data.attendeeName},

This is a friendly reminder about your event tomorrow:

Event: ${data.eventTitle}
Date: ${new Date(data.eventDate).toLocaleDateString()}
Time: ${data.eventTime}
Location: ${data.eventLocation}

Please arrive 10-15 minutes early. If you can't attend, please cancel your registration.

See you tomorrow!

Blackbird Portal Events Team
    `
  }),

  cancellationConfirmation: (data: any) => ({
    subject: `❌ Registration Cancelled: ${data.eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Cancelled</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e1e1e1; }
          .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .button { display: inline-block; background: #2D8EFF; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Registration Cancelled</h1>
          <p>We're sorry to see you go</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.attendeeName},</h2>
          
          <p>Your registration for <strong>${data.eventTitle}</strong> has been successfully cancelled.</p>
          
          <div class="event-details">
            <h3>📅 Cancelled Event</h3>
            <p><strong>Event:</strong> ${data.eventTitle}</p>
            <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${data.eventTime}</p>
            <p><strong>Cancelled:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>We understand that plans change. Your spot has been offered to the next person on the waitlist.</p>
          
          <h3>Stay Connected</h3>
          <p>We have many other exciting events coming up! Browse our upcoming events and find something that fits your schedule better.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/events" class="button">Browse Other Events</a>
          
          <p>We hope to see you at a future event!</p>
        </div>
        
        <div class="footer">
          <p><strong>Blackbird Portal Events</strong></p>
          <p>Immersive technology events and collaborative learning experiences</p>
        </div>
      </body>
      </html>
    `,
    text: `
Registration Cancelled: ${data.eventTitle}

Hello ${data.attendeeName},

Your registration for ${data.eventTitle} has been cancelled.

Event Details:
- Date: ${new Date(data.eventDate).toLocaleDateString()}
- Time: ${data.eventTime}
- Cancelled: ${new Date().toLocaleDateString()}

We hope to see you at a future event!

Blackbird Portal Events Team
    `
  })
}

// Email service functions
export const emailService = {
  async sendRegistrationConfirmation(to: string, eventData: any, attendeeData: any) {
    const template = emailTemplates.registrationConfirmation({
      attendeeName: attendeeData.name,
      eventTitle: eventData.title,
      eventDate: eventData.date,
      eventTime: eventData.time,
      eventDuration: `${eventData.duration} hour${eventData.duration !== 1 ? 's' : ''}`,
      eventLocation: eventData.location,
      eventCategory: eventData.category,
      eventPrerequisites: eventData.prerequisites,
      eventLearning: eventData.whatYouWillLearn
    })

    return this.sendEmail(to, template)
  },

  async sendWaitlistConfirmation(to: string, eventData: any, attendeeData: any) {
    const template = emailTemplates.waitlistConfirmation({
      attendeeName: attendeeData.name,
      eventTitle: eventData.title,
      eventDate: eventData.date,
      eventTime: eventData.time,
      eventLocation: eventData.location
    })

    return this.sendEmail(to, template)
  },

  async sendPromotionFromWaitlist(to: string, eventData: any, attendeeData: any) {
    const template = emailTemplates.promotionFromWaitlist({
      attendeeName: attendeeData.name,
      eventTitle: eventData.title,
      eventDate: eventData.date,
      eventTime: eventData.time,
      eventDuration: `${eventData.duration} hour${eventData.duration !== 1 ? 's' : ''}`,
      eventLocation: eventData.location
    })

    return this.sendEmail(to, template)
  },

  async sendEventReminder(to: string, eventData: any, attendeeData: any) {
    const template = emailTemplates.eventReminder({
      attendeeName: attendeeData.name,
      eventTitle: eventData.title,
      eventDate: eventData.date,
      eventTime: eventData.time,
      eventDuration: `${eventData.duration} hour${eventData.duration !== 1 ? 's' : ''}`,
      eventLocation: eventData.location,
      eventPrerequisites: eventData.prerequisites
    })

    return this.sendEmail(to, template)
  },

  async sendCancellationConfirmation(to: string, eventData: any, attendeeData: any) {
    const template = emailTemplates.cancellationConfirmation({
      attendeeName: attendeeData.name,
      eventTitle: eventData.title,
      eventDate: eventData.date,
      eventTime: eventData.time
    })

    return this.sendEmail(to, template)
  },

  async sendEmail(to: string, template: { subject: string; html: string; text: string }) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('SMTP credentials not configured, skipping email send')
        return { success: false, error: 'SMTP not configured' }
      }

      const transporter = createTransporter()
      
      const mailOptions = {
        from: `"Blackbird Portal Events" <${process.env.SMTP_USER}>`,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      const result = await transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', { to, subject: template.subject, messageId: result.messageId })
      
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
} 

/**
 * Send purchase notification email to a guest
 * @param email Guest email address
 * @param type Type of notification (purchase_received or status_update)
 * @param message Notification message
 * @param purchaseDetails Optional purchase details
 */
export async function sendPurchaseNotification(
  email: string, 
  type: 'purchase_received' | 'status_update',
  message: string,
  purchaseDetails?: {
    productName: string
    quantity: number
    totalAmount: number
    currency: string
    status: string
  }
) {
  try {
    const subject = type === 'purchase_received' 
      ? 'Your Blackbird Portal Purchase Request Received' 
      : 'Update on Your Blackbird Portal Purchase';
    
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://blackbirdportal.com/logo.png" alt="Blackbird Portal" style="max-width: 150px;">
        </div>
        <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">${subject}</h2>
        <div style="line-height: 1.6; color: #444;">
          <p>${message}</p>
    `;
    
    if (purchaseDetails) {
      htmlContent += `
          <div style="background-color: #f9f9f9; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Purchase Details</h3>
            <p><strong>Product:</strong> ${purchaseDetails.productName}</p>
            <p><strong>Quantity:</strong> ${purchaseDetails.quantity}</p>
            <p><strong>Total Amount:</strong> ${purchaseDetails.currency} ${purchaseDetails.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> ${purchaseDetails.status.charAt(0).toUpperCase() + purchaseDetails.status.slice(1)}</p>
          </div>
      `;
    }
    
    htmlContent += `
          <p style="margin-top: 30px;">If you have any questions, please contact our support team.</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #777;">
          <p>© ${new Date().getFullYear()} Blackbird Portal. All rights reserved.</p>
        </div>
      </div>
    `;
    
    // Send email using your preferred email service
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@blackbirdportal.com',
      to: email,
      subject,
      html: htmlContent
    };
    
    // Implementation would depend on your actual email service
    // For example, with nodemailer:
    // await transporter.sendMail(mailOptions);
    
    console.log('Purchase notification email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending purchase notification email:', error);
    return false;
  }
} 