---
name: notifications-email
category: collaboration-communication/collaboration
version: 1.0.0
description: Email notification workflows, templates, and best practices for transactional emails
author: blackbox5/core
verified: true
tags: [notifications, email, transactional, smtp]
---

# Email Notification Workflows

## Context

Email notifications remain one of the most reliable and direct channels for user communication in modern applications. Unlike in-app notifications or push notifications, emails provide a persistent, asynchronous communication channel that works across all platforms and devices.

**Key Characteristics:**

- **Universal Reach**: Every user with an email account can receive notifications
- **High Visibility**: Emails typically have higher open rates than push notifications
- **Asynchronous**: Users can read and respond on their own timeline
- **Searchable**: Emails are easily searchable and archived
- **Rich Content**: Supports HTML, images, and structured layouts
- **Reliable**: Mature infrastructure with high delivery rates

**Email Types:**

1. **Transactional Emails**: Triggered by user actions (password resets, confirmations)
2. **Notification Emails**: Updates about system events (mentions, assignments)
3. **Marketing Emails**: Promotional content (newsletters, announcements)
4. **Digest Emails**: Aggregated updates (daily summaries, weekly reports)

**Deliverability Fundamentals:**

Email deliverability is the ability to successfully deliver emails to recipients' inboxes. It depends on:

- **Sender Reputation**: Based on IP/domain history and sending practices
- **Authentication**: SPF, DKIM, DMARC records proving sender legitimacy
- **Content Quality**: Relevant, non-spammy content with proper formatting
- **Engagement**: Open rates, click rates, and spam complaints
- **Infrastructure**: Proper SMTP configuration and DNS records

## Instructions

### Designing Effective Email Notifications

**1. Purpose-Driven Content**

Every email should have a single, clear purpose:

- **One Call-to-Action (CTA)**: Primary action should be obvious
- **Concise Subject Lines**: Under 50 characters, descriptive and actionable
- **Relevant Preview Text**: First line should complement the subject
- **Scannable Body**: Use headers, bullet points, and short paragraphs
- **Clear Value**: Recipient should understand why they received the email

**2. Timing and Frequency**

- **Immediate**: Time-sensitive notifications (security alerts, confirmations)
- **Batched**: Non-urgent updates (daily/weekly digests)
- **User-Controlled**: Allow users to choose notification preferences
- **Timezone-Aware**: Send at appropriate local times
- **Rate-Limited**: Don't overwhelm users with emails

**3. Personalization**

- **Dynamic Content**: Insert user-specific data (names, dates, references)
- **Behavioral Triggers**: Send based on user actions and preferences
- **Contextual Relevance**: Include relevant details and links
- **Personalized From**: Use recognizable sender names and addresses
- **Targeted Segments**: Different content for different user types

**4. Visual Design**

- **Mobile-First**: 60% of emails are opened on mobile devices
- **Brand Consistency**: Use company colors, logos, and voice
- **Hierarchy**: Guide attention to important information first
- **Whitespace**: Improve readability with spacing
- **Accessibility**: Alt text, sufficient contrast, semantic HTML

**5. Technical Implementation**

- **HTML + Plain Text**: Always provide both versions
- **Inline CSS**: Email clients don't support external stylesheets
- **Responsive Layouts**: Use media queries and fluid widths
- **Testing**: Test across multiple email clients and devices
- **Fallbacks**: Graceful degradation for unsupported features

## Rules

### Deliverability Rules

**Sender Authentication:**

- **SPF (Sender Policy Framework)**: Publish DNS records listing authorized sending IPs
- **DKIM (DomainKeys Identified Mail)**: Cryptographically sign emails
- **DMARC**: Policy for handling unauthenticated emails
- **Reverse DNS**: PTR records for sending IP addresses
- **Dedicated IPs**: For high-volume senders, consider dedicated IP addresses

**Sending Practices:**

- **Warm-Up**: Gradually increase sending volume from new IPs/domains
- **Consistent Volume**: Avoid sudden spikes in sending patterns
- **List Hygiene**: Regularly remove bounced and inactive addresses
- **Double Opt-In**: Confirm email addresses before adding to lists
- **Unsubscribe**: Include clear, working unsubscribe links

**Content Rules:**

- **No Spam Triggers**: Avoid words like "free," "guarantee," "urgent"
- **Balanced Content**: Mix text and images (60/40 ratio)
- **Proper Encoding**: Use UTF-8 and proper MIME types
- **No Attachments**: For transactional emails, link to content instead
- **Clear Footer**: Include physical address and contact information

### Formatting Rules

**Subject Lines:**

- Maximum 50 characters (6 words)
- Use title case or sentence case (avoid ALL CAPS)
- Include relevance indicators (e.g., "[Action Required]")
- Avoid excessive punctuation (!!!, ???)
- Personalize when possible (e.g., "Your order #12345 shipped")

**Body Structure:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Subject</title>
  <style>
    /* Inline CSS here */
  </style>
</head>
<body>
  <!-- Preheader text -->
  <div style="display:none;font-size:1px;line-height:1px">Preview text</div>

  <!-- Email container -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <!-- Header with logo -->
    <!-- Main content -->
    <!-- Call-to-action -->
    <!-- Footer with unsubscribe -->
  </table>
</body>
</html>
```

**CSS Best Practices:**

- Use inline styles for maximum compatibility
- Avoid CSS shorthand properties
- Use tables for layout (not divs)
- Test with email client-safe CSS properties
- Keep styles simple and avoid complex selectors

### Privacy and Consent

**GDPR Compliance:**

- **Explicit Consent**: Users must opt-in to marketing emails
- **Clear Purpose**: State why you're collecting email addresses
- **Data Access**: Allow users to access their email data
- **Right to be Forgotten**: Honor deletion requests
- **Data Portability**: Export user data on request

**CAN-SPAM Compliance:**

- Include accurate header information
- Use truthful subject lines
- Honor unsubscribe requests within 10 days
- Include valid physical postal address
- Monitor what others are doing on your behalf

**User Preferences:**

- Granular notification controls (by type, frequency)
- Easy unsubscribe process (one-click)
- Preference management page
- Clear re-subscription process
- Communication preferences in user settings

## Workflow

### Phase 1: Template Design

**1. Define Requirements**

- Identify notification type (transactional/marketing)
- Determine trigger conditions
- Define target audience
- Establish success metrics (open rate, click rate)
- Plan personalization variables

**2. Create Mockup**

- Design for mobile-first (320px minimum)
- Create responsive breakpoints (480px, 600px, 720px)
- Use brand colors and assets
- Include all content variations
- Plan for dynamic content sections

**3. Write Copy**

- **Subject Line**: Clear, actionable, under 50 chars
- **Preheader**: Complementary to subject, under 100 chars
- **Opening**: State purpose immediately
- **Body**: Concise, scannable, relevant
- **CTA**: Action-oriented, prominent placement
- **Closing**: Professional sign-off

**4. Build HTML Template**

```html
<!-- Transactional Email Template -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <!-- Logo Header -->
  <tr>
    <td align="center" bgcolor="#ffffff">
      <img src="logo.png" alt="Company Logo" width="200">
    </td>
  </tr>

  <!-- Main Content -->
  <tr>
    <td bgcolor="#f4f4f4" padding="20">
      <table width="600" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <h1>{{subject}}</h1>
            <p>Hello {{name}},</p>
            <p>{{main_message}}</p>

            <!-- Dynamic Content -->
            {{#if items}}
            <table>
              {{#each items}}
              <tr>
                <td>{{this.title}}</td>
                <td>{{this.value}}</td>
              </tr>
              {{/each}}
            </table>
            {{/if}}

            <!-- CTA Button -->
            <table>
              <tr>
                <td align="center">
                  <a href="{{cta_url}}" class="button">{{cta_text}}</a>
                </td>
              </tr>
            </table>

            <p>
              If you didn't request this, please ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td bgcolor="#333333" padding="20">
      <p style="color: #ffffff; font-size: 12px;">
        © {{year}} {{company}}. All rights reserved.<br>
        {{address}}<br>
        <a href="{{unsubscribe_url}}" style="color: #ffffff;">Unsubscribe</a>
      </p>
    </td>
  </tr>
</table>
```

**5. Create Plain Text Version**

```
Hello {{name}},

{{main_message}}

{{#if items}}
{{#each items}}
- {{this.title}}: {{this.value}}
{{/each}}
{{/if}}

To take action: {{cta_url}}

---
© {{year}} {{company}}
{{address}}
Unsubscribe: {{unsubscribe_url}}
```

### Phase 2: Sending

**1. Choose Email Provider**

- **SendGrid**: Advanced analytics, templates, 100 free/day
- **Mailgun**: Powerful API, 5,000 free/month
- **AWS SES**: Cost-effective for high volume, pay-as-you-go
- **Postmark**: Fast delivery, excellent for transactional emails
- **SparkPost**: Enterprise features, scalable

**2. Configure SMTP/API**

```javascript
// SendGrid API Example
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html, text) => {
  const msg = {
    to: to,
    from: 'noreply@yourdomain.com',
    subject: subject,
    html: html,
    text: text,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
```

**3. Implement Queue System**

- Use message queues (RabbitMQ, Redis, Bull)
- Background workers for sending
- Retry logic with exponential backoff
- Rate limiting per user and globally
- Dead letter queue for failed sends

**4. Send Email**

- Validate email addresses
- Render template with user data
- Generate both HTML and plain text
- Send via chosen provider
- Log send attempt
- Handle delivery status

### Phase 3: Tracking

**1. Delivery Metrics**

- **Delivery Rate**: % of emails successfully delivered
- **Bounce Rate**: % of emails that couldn't be delivered
- **Delivery Time**: Average time to send
- **Queue Depth**: Number of emails pending

**2. Engagement Metrics**

- **Open Rate**: % of delivered emails opened
- **Click Rate**: % of opened emails with clicks
- **Conversion Rate**: % of clicks leading to desired action
- **Unsubscribe Rate**: % of recipients who unsubscribe
- **Spam Complaints**: % marked as spam

**3. Technical Metrics**

- **API Response Time**: Average provider response time
- **Error Rate**: % of failed send attempts
- **Retry Rate**: % of emails requiring retries
- **IP Reputation**: Sender reputation score

**4. Monitoring**

- Real-time dashboards
- Alert thresholds for critical metrics
- Daily/weekly reports
- Trend analysis
- Comparative analysis (industry benchmarks)

### Phase 4: Optimization

**1. A/B Testing**

- Test subject lines (length, personalization, urgency)
- Test send times (day of week, time of day)
- Test content (copy length, image placement)
- Test CTAs (button text, color, placement)
- Test sender name/address

**2. List Hygiene**

- Regular validation of email addresses
- Remove bounced addresses
- Segment inactive users
- Re-engagement campaigns
- Sunset inactive addresses

**3. Content Optimization**

- Improve subject line copy
- Optimize preview text
- Enhance email design
- Personalize content
- Segment audience better

**4. Technical Optimization**

- Improve email infrastructure
- Optimize template performance
- Enhance authentication records
- Implement feedback loops
- Monitor blacklist status

## Best Practices

### HTML Email Development

**1. Table-Based Layouts**

```html
<!-- Use tables for structure -->
<table width="600" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="200">Left column</td>
    <td width="400">Right column</td>
  </tr>
</table>
```

**2. Inline CSS**

```html
<!-- Apply styles directly to elements -->
<p style="font-family: Arial; font-size: 16px; color: #333;">
  Your text here
</p>
```

**3. Responsive Design**

```html
<!-- Use media queries for mobile -->
<style>
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .column { display: block !important; width: 100% !important; }
  }
</style>
```

**4. Email Client Compatibility**

- Test in Gmail, Outlook, Apple Mail, Yahoo
- Test on mobile (iOS Mail, Gmail app)
- Use client-specific CSS when needed
- Provide fallbacks for unsupported features
- Test with email testing tools (Litmus, Email on Acid)

### Authentication Setup

**SPF Record:**

```
yourdomain.com. IN TXT "v=spf1 include:sendgrid.net -all"
```

**DKIM Record:**

```
sendgrid._domainkey.yourdomain.com. IN TXT "k=rsa; p=MIGfMA0GC..."
```

**DMARC Record:**

```
_dmarc.yourdomain.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### Responsive Design

**1. Mobile-First Approach**

```html
<!-- Start with single column for mobile -->
<table width="100%">
  <tr>
    <td>Mobile content</td>
  </tr>
</table>

<!-- Add media queries for desktop -->
<style>
  @media only screen and (min-width: 600px) {
    .container { width: 600px; margin: 0 auto; }
  }
</style>
```

**2. Touch-Friendly CTAs**

```html
<!-- Minimum 44x44 pixels for touch targets -->
<a href="{{url}}" style="display: inline-block; padding: 15px 30px;">
  Click Here
</a>
```

**3. Readable Text**

```html
<!-- Base font size: 16px -->
<p style="font-size: 16px; line-height: 1.5;">
  Readable paragraph text
</p>
```

### Deliverability Optimization

**1. Warm-Up Strategy**

- Week 1: Send 50 emails/day
- Week 2: Send 200 emails/day
- Week 3: Send 1,000 emails/day
- Week 4: Send 5,000 emails/day
- Week 5+: Ramp to full volume

**2. List Management**

- Remove role-based addresses (admin@, info@)
- Validate email addresses before sending
- Segment by engagement (active, inactive, new)
- Implement double opt-in
- Regular list cleaning (quarterly)

**3. Engagement Tracking**

- Monitor open rates by segment
- Track click patterns
- Analyze unsubscribe reasons
- Monitor spam complaints
- Measure conversion rates

## Anti-Patterns

### Common Mistakes

**1. Spam Triggers**

```html
<!-- BAD: Spammy content -->
<p>!!! FREE MONEY !!! Click NOW for GUARANTEED results!!!</p>

<!-- GOOD: Clear, honest content -->
<p>Your account statement is ready to view.</p>
```

**2. Broken Images**

```html
<!-- BAD: External images may be blocked -->
<img src="http://external-site.com/image.jpg">

<!-- GOOD: Host images on your domain or embed base64 -->
<img src="https://yourdomain.com/images/logo.jpg">
```

**3. No Plain Text Version**

```javascript
// BAD: Only sending HTML
await sendEmail({ html: htmlContent });

// GOOD: Always include plain text
await sendEmail({
  html: htmlContent,
  text: textContent
});
```

**4. Complex JavaScript**

```html
<!-- BAD: JavaScript not supported in email -->
<script>
  document.getElementById('button').addEventListener('click', handler);
</script>

<!-- GOOD: Use direct links -->
<a href="https://yourdomain.com/action">Click Here</a>
```

**5. Excessive Styling**

```html
<!-- BAD: Complex CSS not supported -->
<div style="display: flex; grid-template-columns: 1fr 1fr;">
  Content
</div>

<!-- GOOD: Simple table layouts -->
<table>
  <tr>
    <td>Column 1</td>
    <td>Column 2</td>
  </tr>
</table>
```

### Deliverability Killers

**1. Buying Email Lists**

- Never purchase or rent email lists
- Unsolicited emails damage sender reputation
- High spam complaints and bounce rates
- Legal compliance issues (GDPR, CAN-SPAM)
- Poor engagement and conversion rates

**2. Ignoring Bounces**

```javascript
// BAD: Continue sending to bounced addresses
function sendEmails(emails) {
  emails.forEach(email => send(email));
}

// GOOD: Remove bounced addresses
async function sendEmails(emails) {
  const validEmails = await validateEmails(emails);
  validEmails.forEach(email => send(email));
}
```

**3. Sending Too Fast**

```javascript
// BAD: Send all at once
await Promise.all(emails.map(email => send(email)));

// GOOD: Rate limit sending
for (const email of emails) {
  await send(email);
  await delay(100); // 100ms between sends
}
```

**4. Poor Subject Lines**

```
BAD:
- "Read this!!!"
- "Important update"
- "[Notification]"
- "You have a message"

GOOD:
- "Your order #12345 has shipped"
- "Password reset request for your account"
- "Jane mentioned you in Project X"
- "Weekly digest: 5 new updates"
```

**5. Neglecting Preferences**

```javascript
// BAD: Send all notifications to all users
function notifyUser(user, notification) {
  sendEmail(user.email, notification);
}

// GOOD: Respect user preferences
function notifyUser(user, notification) {
  if (user.preferences.email[notification.type]) {
    sendEmail(user.email, notification);
  }
}
```

## Examples

### Example 1: Welcome Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{app_name}}</title>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4">
    <!-- Header -->
    <tr>
      <td align="center" bgcolor="#ffffff" style="padding: 20px 0;">
        <img src="{{logo_url}}" alt="{{app_name}}" width="120">
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td bgcolor="#f4f4f4" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" align="center">
          <tr>
            <td bgcolor="#ffffff" style="padding: 40px; border-radius: 4px;">
              <h1 style="color: #333; font-size: 24px; margin: 0 0 20px;">
                Welcome to {{app_name}}, {{name}}!
              </h1>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                We're thrilled to have you on board. {{app_name}} helps you
                {{main_benefit}}.
              </p>

              <!-- Getting Started Steps -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 20px 0; border-bottom: 1px solid #eee;">
                    <strong>Step 1:</strong> Complete your profile
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 0; border-bottom: 1px solid #eee;">
                    <strong>Step 2:</strong> Explore our features
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 0;">
                    <strong>Step 3:</strong> Connect with the community
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{cta_url}}"
                       style="display: inline-block; padding: 15px 30px;
                              background-color: #007bff; color: #ffffff;
                              text-decoration: none; border-radius: 4px;
                              font-weight: bold;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666; font-size: 14px;">
                Questions? Just reply to this email, we're here to help.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td bgcolor="#333333" style="padding: 20px;">
        <table width="600" cellpadding="0" cellspacing="0" align="center">
          <tr>
            <td style="color: #ffffff; font-size: 12px; text-align: center;">
              <p style="margin: 0 0 10px;">
                © {{year}} {{app_name}}. All rights reserved.
              </p>
              <p style="margin: 0;">
                {{company_address}}
              </p>
              <p style="margin: 10px 0 0;">
                <a href="{{unsubscribe_url}}"
                   style="color: #ffffff; text-decoration: underline;">
                  Unsubscribe
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Example 2: Alert Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Action Required] {{alert_title}}</title>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4">
    <!-- Alert Banner -->
    <tr>
      <td bgcolor="#dc3545" style="padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">
          Action Required
        </h1>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" align="center">
          <tr>
            <td bgcolor="#ffffff" style="padding: 30px; border-radius: 4px;">
              <h2 style="color: #333; font-size: 20px; margin: 0 0 15px;">
                {{alert_title}}
              </h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                {{alert_message}}
              </p>

              <!-- Alert Details -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="margin: 20px 0; background-color: #fff3cd;
                            padding: 15px; border-left: 4px solid #ffc107;">
                <tr>
                  <td style="color: #856404; font-size: 14px;">
                    <strong>What happened:</strong><br>
                    {{what_happened}}
                    <br><br>
                    <strong>Why it matters:</strong><br>
                    {{why_it_matters}}
                    <br><br>
                    <strong>What you need to do:</strong><br>
                    {{action_required}}
                  </td>
                </tr>
              </table>

              <!-- Primary CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="{{primary_action_url}}"
                       style="display: inline-block; padding: 15px 30px;
                              background-color: #dc3545; color: #ffffff;
                              text-decoration: none; border-radius: 4px;
                              font-weight: bold;">
                      {{primary_action_text}}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Secondary CTA -->
              <p style="text-align: center; margin: 20px 0;">
                <a href="{{secondary_action_url}}"
                   style="color: #dc3545; text-decoration: underline;">
                  {{secondary_action_text}}
                </a>
              </p>

              <!-- Timestamp -->
              <p style="color: #999; font-size: 12px; text-align: center;">
                Alert triggered: {{timestamp}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td bgcolor="#333333" style="padding: 20px;">
        <p style="color: #ffffff; font-size: 12px; text-align: center; margin: 0;">
          You're receiving this alert because {{alert_reason}}.
          <a href="{{notification_settings_url}}"
             style="color: #ffffff; text-decoration: underline;">
            Manage notification preferences
          </a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Example 3: Digest Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{digest_title}} - {{date}}</title>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4">
    <!-- Header -->
    <tr>
      <td align="center" bgcolor="#ffffff" style="padding: 30px 20px;">
        <h1 style="color: #333; font-size: 24px; margin: 0;">
          {{digest_title}}
        </h1>
        <p style="color: #666; font-size: 14px; margin: 5px 0 0;">
          {{date}} • {{item_count}} updates
        </p>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 30px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" align="center">

          {{#each sections}}

          <!-- Section Header -->
          <tr>
            <td style="padding: 20px 0 10px; border-bottom: 2px solid #007bff;">
              <h2 style="color: #007bff; font-size: 18px; margin: 0;">
                {{this.section_name}}
              </h2>
            </td>
          </tr>

          {{#each this.items}}

          <!-- Item -->
          <tr>
            <td bgcolor="#ffffff"
                style="padding: 20px; margin: 10px 0; border-radius: 4px;
                       border-bottom: 1px solid #eee;">
              <h3 style="color: #333; font-size: 16px; margin: 0 0 10px;">
                <a href="{{this.url}}"
                   style="color: #007bff; text-decoration: none;">
                  {{this.title}}
                </a>
              </h3>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0 0 10px;">
                {{this.description}}
              </p>

              <!-- Item Metadata -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #999; font-size: 12px;">
                    {{this.author}} • {{this.time}}
                  </td>
                  <td align="right">
                    <a href="{{this.url}}"
                       style="color: #007bff; font-size: 12px;
                              text-decoration: none;">
                      View →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {{/each}}

          {{/each}}

          <!-- Summary Stats -->
          <tr>
            <td bgcolor="#f8f9fa"
                style="padding: 20px; border-radius: 4px; margin: 20px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px;">
                    <strong style="color: #333; font-size: 24px;">
                      {{total_updates}}
                    </strong>
                    <div style="color: #666; font-size: 12px;">Total Updates</div>
                  </td>
                  <td align="center" style="padding: 10px;">
                    <strong style="color: #333; font-size: 24px;">
                      {{unread_count}}
                    </strong>
                    <div style="color: #666; font-size: 12px;">Unread</div>
                  </td>
                  <td align="center" style="padding: 10px;">
                    <strong style="color: #333; font-size: 24px;">
                      {{mentions}}
                    </strong>
                    <div style="color: #666; font-size: 12px;">Mentions</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="{{view_all_url}}"
                 style="display: inline-block; padding: 15px 30px;
                        background-color: #007bff; color: #ffffff;
                        text-decoration: none; border-radius: 4px;
                        font-weight: bold;">
                View All Updates
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td bgcolor="#333333" style="padding: 20px;">
        <table width="600" cellpadding="0" cellspacing="0" align="center">
          <tr>
            <td style="color: #ffffff; font-size: 12px; text-align: center;">
              <p style="margin: 0 0 10px;">
                <a href="{{manage_digest_url}}"
                   style="color: #ffffff; text-decoration: underline;">
                  Manage digest frequency
                </a>
              </p>
              <p style="margin: 0;">
                © {{year}} {{app_name}}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Integration Notes

### Email Provider Integration

**SendGrid Setup:**

```javascript
// Install SDK
npm install @sendgrid/mail

// Initialize
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Advanced configuration
const msg = {
  to: 'recipient@example.com',
  from: {
    email: 'noreply@yourdomain.com',
    name: 'Your App'
  },
  subject: 'Welcome!',
  templateId: 'd-1234567890abcdef',
  dynamicTemplateData: {
    name: 'John Doe',
    cta_url: 'https://yourdomain.com/welcome'
  },
  customArgs: {
    user_id: '12345',
    notification_type: 'welcome'
  },
  trackingSettings: {
    clickTracking: { enable: true },
    openTracking: { enable: true },
    subscriptionTracking: { enable: true }
  },
  mailSettings: {
    sandboxMode: { enable: process.env.NODE_ENV !== 'production' }
  }
};

await sgMail.send(msg);
```

**Mailgun Setup:**

```javascript
// Install SDK
npm install mailgun-js

// Initialize
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

// Send email
const data = {
  from: 'Your App <noreply@yourdomain.com>',
  to: 'recipient@example.com',
  subject: 'Welcome!',
  template: 'welcome-email',
  'h:X-Mailgun-Variables': JSON.stringify({
    name: 'John Doe',
    cta_url: 'https://yourdomain.com/welcome'
  }),
  'o:tracking': true,
  'o:tracking-clicks': true,
  'o:tracking-opens': true
};

mailgun.messages().send(data, (error, body) => {
  if (error) console.error(error);
  console.log(body);
});
```

**AWS SES Setup:**

```javascript
// Install SDK
npm install @aws-sdk/client-ses

// Initialize
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Send email
async function sendEmail(to, subject, html, text) {
  const params = {
    Source: 'noreply@yourdomain.com',
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
        Text: { Data: text }
      }
    },
    ConfigurationSetName: 'MyConfigurationSet',
    Tags: [
      { Name: 'notification_type', Value: 'welcome' }
    ]
  };

  const command = new SendEmailCommand(params);
  await sesClient.send(command);
}
```

### Webhook Integration

**Handling Webhooks:**

```javascript
// SendGrid webhook handler
app.post('/webhooks/sendgrid', async (req, res) => {
  const events = req.body;

  for (const event of events) {
    switch (event.event) {
      case 'delivered':
        await updateDeliveryStatus(event.email, 'delivered');
        break;
      case 'open':
        await recordOpen(event.email, event.url);
        break;
      case 'click':
        await recordClick(event.email, event.url);
        break;
      case 'bounce':
        await handleBounce(event.email, event.reason);
        break;
      case 'spamreport':
        await handleSpamComplaint(event.email);
        break;
      case 'dropped':
        await handleDroppedEmail(event.email, event.reason);
        break;
    }
  }

  res.sendStatus(200);
});
```

### Queue Integration

**Bull Queue with Redis:**

```javascript
const Queue = require('bull');
const emailQueue = new Queue('email sending', 'redis://localhost:6379');

// Email worker
emailQueue.process(async (job) => {
  const { to, subject, html, text } = job.data;

  try {
    await sendEmail(to, subject, html, text);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
});

// Retry configuration
emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

// Add to queue
await emailQueue.add({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Hello!</p>',
  text: 'Hello!'
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000
  },
  removeOnComplete: 100,
  removeOnFail: 500
});
```

### Database Integration

**Email Logging:**

```sql
CREATE TABLE email_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  bounce_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
```

## Error Handling

### Bounce Handling

**Hard Bounces (Permanent Failures):**

- Invalid email address
- Domain doesn't exist
- Recipient server rejection
- **Action**: Remove from list immediately

**Soft Bounces (Temporary Failures):**

- Mailbox full
- Server temporarily unavailable
- Message too large
- **Action**: Retry 3 times, then remove

```javascript
async function handleBounce(email, bounceType, reason) {
  if (bounceType === 'hard') {
    // Remove from mailing list
    await removeFromMailingList(email);
    await logBounce(email, 'hard', reason);
  } else {
    // Retry logic
    const attempts = await getBounceAttempts(email);

    if (attempts >= 3) {
      await removeFromMailingList(email);
      await logBounce(email, 'soft-max', reason);
    } else {
      await incrementBounceAttempts(email);
      await scheduleRetry(email);
    }
  }
}
```

### Spam Complaints

```javascript
async function handleSpamComplaint(email) {
  // Immediately unsubscribe
  await unsubscribeEmail(email);

  // Update sender reputation tracking
  await incrementSpamComplaints();

  // Remove from all lists
  await removeFromAllLists(email);

  // Log for review
  await logSpamComplaint(email);

  // Alert if complaints exceed threshold
  const recentComplaints = await getRecentComplaints(24);
  if (recentComplaints > 10) {
    await alertTeam('High spam complaint rate detected');
  }
}
```

### Delivery Failures

```javascript
async function handleDeliveryFailure(email, error) {
  // Log error
  await logDeliveryError(email, error);

  // Categorize error
  const errorType = categorizeError(error);

  switch (errorType) {
    case 'timeout':
      // Retry with exponential backoff
      await scheduleRetry(email, { backoff: 'exponential' });
      break;

    case 'rate_limit':
      // Delay and retry
      await scheduleRetry(email, { delay: 3600000 }); // 1 hour
      break;

    case 'authentication':
      // Critical error - alert team
      await alertTeam(`Email authentication failure: ${error.message}`);
      break;

    case 'content_rejected':
      // Review content
      await flagForReview(email, error.reason);
      break;

    default:
      await logUnknownError(error);
  }
}
```

### Retry Strategies

```javascript
class EmailRetryHandler {
  constructor() {
    this.maxRetries = 3;
    this.baseDelay = 5000; // 5 seconds
  }

  async retryWithBackoff(emailFn, attempt = 0) {
    try {
      return await emailFn();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw new Error(`Max retries exceeded: ${error.message}`);
      }

      const delay = this.baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1} in ${delay}ms`);

      await this.sleep(delay);
      return this.retryWithBackoff(emailFn, attempt + 1);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Output Format

### Email Template Structure

```yaml
email:
  metadata:
    id: "welcome-email-v1"
    version: "1.0.0"
    template_type: "transactional"
    last_updated: "2025-01-18"

  configuration:
    from_email: "noreply@yourdomain.com"
    from_name: "Your App"
    reply_to: "support@yourdomain.com"
    template_id: "d-1234567890abcdef"

  content:
    subject: "Welcome to {{app_name}}, {{name}}!"
    preheader: "Get started with your account in 3 simple steps"
    html_template: "templates/welcome-email.html"
    text_template: "templates/welcome-email.txt"

  variables:
    - name: "app_name"
      type: "string"
      required: true
      default: "Your App"

    - name: "name"
      type: "string"
      required: true

    - name: "cta_url"
      type: "url"
      required: true

  tracking:
    track_opens: true
    track_clicks: true
    custom_args:
      notification_type: "welcome"
      campaign: "onboarding"

  sending:
    priority: "high"
    send_in_batches: false
    rate_limit: null

  post_send:
    log_to_database: true
    trigger_webhook: true
    update_user_metrics: true
```

## Related Skills

- **notifications-local**: In-app notification systems and real-time updates
- **notifications-slack**: Slack integration for team notifications
- **workflow-automation**: Automated notification workflows and triggers
- **api-webhooks**: Webhook configuration and event handling

## See Also

- **SendGrid Documentation**: https://docs.sendgrid.com/
- **Mailgun Documentation**: https://documentation.mailgun.com/
- **AWS SES Documentation**: https://docs.aws.amazon.com/ses/
- **Email on Acid**: https://www.emailonacid.com/ (email testing)
- **Litmus**: https://litmus.com/ (email testing and analytics)
- **GDPR Guidelines**: https://gdpr.eu/email-marketing/
- **CAN-SPAM Act**: https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/can-spam-act
- **M3AAWG**: https://www.m3aawg.org/ (Messaging, Malware and Mobile Anti-Abuse Working Group)
