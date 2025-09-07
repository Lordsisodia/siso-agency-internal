# 🔗 INTEGRATIONS - API & Service Integration Templates

**Comprehensive integration templates for seamless third-party service connections.**

## 📁 **Directory Structure**

```
INTEGRATIONS/
├── README.md                     # This comprehensive guide
├── api-clients/                  # Third-party API client templates
│   ├── openai-integration/       # OpenAI API client
│   ├── supabase-integration/     # Supabase client setup
│   ├── stripe-integration/       # Stripe payment integration
│   └── README.md                # API client guide
├── authentication/               # Auth provider integrations
│   ├── oauth-providers/          # OAuth integration templates
│   ├── saml-integration/         # SAML authentication
│   ├── social-logins/            # Social login integrations
│   └── README.md                # Authentication integration guide
├── webhooks/                     # Webhook handlers and templates
│   ├── webhook-handlers/         # Generic webhook handling
│   ├── event-processing/         # Event processing templates
│   ├── webhook-security/         # Webhook security patterns
│   └── README.md                # Webhook integration guide
├── database-integrations/        # Database connection templates
│   ├── postgresql-client/        # PostgreSQL integration
│   ├── redis-client/             # Redis client setup
│   ├── mongodb-client/           # MongoDB integration
│   └── README.md                # Database integration guide
├── messaging/                    # Messaging service integrations
│   ├── email-services/           # Email service integrations
│   ├── sms-services/             # SMS service integrations
│   ├── push-notifications/       # Push notification services
│   └── README.md                # Messaging integration guide
├── monitoring-integrations/      # Monitoring service integrations
│   ├── sentry-integration/       # Sentry error tracking
│   ├── analytics-integration/    # Analytics service setup
│   ├── logging-services/         # Logging service integrations
│   └── README.md                # Monitoring integration guide
├── cloud-services/               # Cloud service integrations
│   ├── aws-services/             # AWS service integrations
│   ├── gcp-services/             # Google Cloud integrations
│   ├── azure-services/           # Azure service integrations
│   └── README.md                # Cloud service integration guide
└── rate-limiting/                # Rate limiting and quotas
    ├── api-rate-limits/          # API rate limiting templates
    ├── quota-management/         # Quota tracking and management
    ├── backoff-strategies/       # Retry and backoff patterns
    └── README.md                # Rate limiting guide
```

## 🎯 **Purpose & Benefits**

### **Rapid Integration**
- **Pre-built Clients**: Ready-to-use API client templates
- **Error Handling**: Comprehensive error handling and retry logic
- **Authentication**: Secure authentication patterns for all services
- **Rate Limiting**: Built-in rate limiting and quota management

### **Reliability & Security**
- **Secure Connections**: TLS/SSL and proper authentication
- **Input Validation**: Comprehensive input validation and sanitization
- **Secret Management**: Secure API key and credential management
- **Audit Logging**: Complete audit trails for all integrations

### **Monitoring & Observability**
- **Integration Monitoring**: Health checks and performance monitoring
- **Error Tracking**: Detailed error tracking and alerting
- **Usage Analytics**: API usage tracking and optimization
- **Performance Metrics**: Response time and success rate monitoring

## 🚀 **Quick Start Guide**

### **1. API Client Setup**
```bash
# Install integration dependencies
npm install axios openai @supabase/supabase-js stripe

# Copy API client templates
cp -r INTEGRATIONS/api-clients/openai-integration/ ./src/integrations/openai/
cp -r INTEGRATIONS/api-clients/supabase-integration/ ./src/integrations/supabase/
```

### **2. Authentication Integration**
```bash
# Setup OAuth providers
cp -r INTEGRATIONS/authentication/oauth-providers/ ./src/auth/providers/
cp INTEGRATIONS/authentication/auth-middleware.js ./src/middleware/
```

### **3. Webhook Handlers**
```bash
# Setup webhook infrastructure
cp -r INTEGRATIONS/webhooks/webhook-handlers/ ./src/webhooks/
cp INTEGRATIONS/webhooks/webhook-security/ ./src/middleware/webhook-auth.js
```

## 📋 **Integration Categories**

### **🤖 AI Service Integrations**

#### **OpenAI Client Integration**
```javascript
const OpenAI = require('openai');
const rateLimit = require('p-ratelimit');

class OpenAIClient {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    // Rate limiting: 60 requests per minute
    this.rateLimiter = rateLimit({
      interval: 60 * 1000,
      rate: 60,
      concurrency: 10
    });

    this.retryAttempts = 3;
    this.baseDelay = 1000;
  }

  async generateCompletion(prompt, options = {}) {
    return this.rateLimiter(async () => {
      const requestOptions = {
        model: options.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        ...options
      };

      try {
        const response = await this.retryWithBackoff(
          () => this.client.chat.completions.create(requestOptions)
        );

        // Log usage for monitoring
        await this.logUsage({
          model: requestOptions.model,
          tokensUsed: response.usage.total_tokens,
          cost: this.calculateCost(response.usage, requestOptions.model)
        });

        return {
          content: response.choices[0].message.content,
          usage: response.usage,
          model: response.model
        };
      } catch (error) {
        await this.logError('generateCompletion', error, requestOptions);
        throw this.handleError(error);
      }
    });
  }

  async retryWithBackoff(operation, attempt = 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.retryAttempts || !this.isRetryableError(error)) {
        throw error;
      }

      const delay = this.baseDelay * Math.pow(2, attempt - 1);
      await this.sleep(delay);
      return this.retryWithBackoff(operation, attempt + 1);
    }
  }

  isRetryableError(error) {
    return (
      error.status === 429 || // Rate limit
      error.status === 500 || // Server error
      error.status === 502 || // Bad gateway
      error.status === 503 || // Service unavailable
      error.status === 504    // Gateway timeout
    );
  }

  calculateCost(usage, model) {
    const pricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    return (
      (usage.prompt_tokens * modelPricing.input) +
      (usage.completion_tokens * modelPricing.output)
    ) / 1000;
  }

  async logUsage(data) {
    // Log to your analytics/monitoring system
    console.log('OpenAI Usage:', {
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  async logError(operation, error, context) {
    console.error('OpenAI Error:', {
      operation,
      error: error.message,
      status: error.status,
      context,
      timestamp: new Date().toISOString()
    });
  }

  handleError(error) {
    const errorMap = {
      400: 'Invalid request parameters',
      401: 'Invalid API key',
      403: 'Insufficient permissions',
      404: 'Resource not found',
      429: 'Rate limit exceeded',
      500: 'OpenAI server error'
    };

    return new Error(
      errorMap[error.status] || `OpenAI API error: ${error.message}`
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = OpenAIClient;
```

### **💳 Payment Integration**

#### **Stripe Payment Integration**
```javascript
const Stripe = require('stripe');
const crypto = require('crypto');

class StripeClient {
  constructor() {
    this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString()
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      await this.logTransaction('payment_intent_created', {
        id: paymentIntent.id,
        amount,
        currency,
        status: paymentIntent.status
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      };
    } catch (error) {
      await this.logError('createPaymentIntent', error, { amount, currency });
      throw this.handleStripeError(error);
    }
  }

  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata
      });

      await this.logTransaction('subscription_created', {
        id: subscription.id,
        customerId,
        priceId,
        status: subscription.status
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      };
    } catch (error) {
      await this.logError('createSubscription', error, { customerId, priceId });
      throw this.handleStripeError(error);
    }
  }

  async handleWebhook(rawBody, signature) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      await this.logError('webhook_verification', error, { signature });
      throw new Error('Invalid webhook signature');
    }

    await this.logWebhookEvent(event);

    switch (event.type) {
      case 'payment_intent.succeeded':
        return this.handlePaymentSucceeded(event.data.object);
        
      case 'payment_intent.payment_failed':
        return this.handlePaymentFailed(event.data.object);
        
      case 'customer.subscription.created':
        return this.handleSubscriptionCreated(event.data.object);
        
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event.data.object);
        
      case 'invoice.payment_succeeded':
        return this.handleInvoicePaymentSucceeded(event.data.object);
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { received: true };
    }
  }

  async handlePaymentSucceeded(paymentIntent) {
    // Update your database with successful payment
    await this.logTransaction('payment_succeeded', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });

    // Trigger post-payment actions (emails, fulfillment, etc.)
    await this.triggerPaymentSuccessActions(paymentIntent);

    return { processed: true };
  }

  async handlePaymentFailed(paymentIntent) {
    await this.logTransaction('payment_failed', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      failureCode: paymentIntent.last_payment_error?.code,
      failureMessage: paymentIntent.last_payment_error?.message
    });

    return { processed: true };
  }

  handleStripeError(error) {
    const errorMap = {
      'card_error': 'Your card was declined',
      'validation_error': 'Invalid payment information',
      'api_error': 'Payment processing error',
      'rate_limit_error': 'Too many requests'
    };

    return new Error(
      errorMap[error.type] || `Stripe error: ${error.message}`
    );
  }

  async logTransaction(type, data) {
    console.log('Stripe Transaction:', {
      type,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  async logWebhookEvent(event) {
    console.log('Stripe Webhook:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString()
    });
  }

  async logError(operation, error, context) {
    console.error('Stripe Error:', {
      operation,
      error: error.message,
      type: error.type,
      context,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = StripeClient;
```

### **📧 Email Service Integration**

#### **Comprehensive Email Service**
```javascript
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    this.setupProvider();
  }

  setupProvider() {
    switch (this.provider) {
      case 'sendgrid':
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        break;
        
      case 'ses':
        this.ses = new AWS.SES({
          region: process.env.AWS_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        break;
        
      case 'smtp':
        this.transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        break;
    }
  }

  async sendEmail(options) {
    const emailData = {
      from: options.from || process.env.DEFAULT_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
      templateId: options.templateId,
      templateData: options.templateData
    };

    try {
      let result;
      
      switch (this.provider) {
        case 'sendgrid':
          result = await this.sendWithSendGrid(emailData);
          break;
          
        case 'ses':
          result = await this.sendWithSES(emailData);
          break;
          
        case 'smtp':
          result = await this.sendWithSMTP(emailData);
          break;
          
        default:
          throw new Error(`Unsupported email provider: ${this.provider}`);
      }

      await this.logEmailSent(emailData, result);
      return result;
      
    } catch (error) {
      await this.logEmailError(emailData, error);
      throw this.handleEmailError(error);
    }
  }

  async sendWithSendGrid(emailData) {
    const msg = {
      to: emailData.to,
      from: emailData.from,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    };

    if (emailData.templateId) {
      msg.templateId = emailData.templateId;
      msg.dynamicTemplateData = emailData.templateData;
    }

    const [response] = await sgMail.send(msg);
    return {
      messageId: response.headers['x-message-id'],
      provider: 'sendgrid',
      status: 'sent'
    };
  }

  async sendWithSES(emailData) {
    const params = {
      Source: emailData.from,
      Destination: {
        ToAddresses: Array.isArray(emailData.to) ? emailData.to : [emailData.to]
      },
      Message: {
        Subject: {
          Data: emailData.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: emailData.html ? {
            Data: emailData.html,
            Charset: 'UTF-8'
          } : undefined,
          Text: emailData.text ? {
            Data: emailData.text,
            Charset: 'UTF-8'
          } : undefined
        }
      }
    };

    const result = await this.ses.sendEmail(params).promise();
    return {
      messageId: result.MessageId,
      provider: 'ses',
      status: 'sent'
    };
  }

  async sendWithSMTP(emailData) {
    const mailOptions = {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      attachments: emailData.attachments
    };

    const result = await this.transporter.sendMail(mailOptions);
    return {
      messageId: result.messageId,
      provider: 'smtp',
      status: 'sent'
    };
  }

  // Email templates
  async sendWelcomeEmail(userEmail, userName, verificationLink) {
    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to SISO!',
      templateId: 'welcome-email',
      templateData: {
        userName,
        verificationLink,
        supportEmail: process.env.SUPPORT_EMAIL
      }
    });
  }

  async sendPasswordReset(userEmail, resetLink) {
    return this.sendEmail({
      to: userEmail,
      subject: 'Password Reset Request',
      templateId: 'password-reset',
      templateData: {
        resetLink,
        expiryTime: '24 hours'
      }
    });
  }

  async sendTaskReminder(userEmail, tasks) {
    return this.sendEmail({
      to: userEmail,
      subject: 'Daily Task Reminder',
      templateId: 'task-reminder',
      templateData: {
        tasks,
        taskCount: tasks.length,
        dashboardLink: `${process.env.APP_URL}/dashboard`
      }
    });
  }

  handleEmailError(error) {
    const errorMap = {
      'authentication': 'Email service authentication failed',
      'rate_limit': 'Email rate limit exceeded',
      'invalid_email': 'Invalid email address',
      'template_not_found': 'Email template not found'
    };

    return new Error(
      errorMap[error.code] || `Email service error: ${error.message}`
    );
  }

  async logEmailSent(emailData, result) {
    console.log('Email Sent:', {
      to: emailData.to,
      subject: emailData.subject,
      messageId: result.messageId,
      provider: result.provider,
      timestamp: new Date().toISOString()
    });
  }

  async logEmailError(emailData, error) {
    console.error('Email Error:', {
      to: emailData.to,
      subject: emailData.subject,
      error: error.message,
      provider: this.provider,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = EmailService;
```

### **🔐 Webhook Security**

#### **Webhook Authentication & Validation**
```javascript
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

class WebhookSecurity {
  constructor() {
    this.webhookSecrets = {
      stripe: process.env.STRIPE_WEBHOOK_SECRET,
      github: process.env.GITHUB_WEBHOOK_SECRET,
      sendgrid: process.env.SENDGRID_WEBHOOK_SECRET
    };

    this.rateLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many webhook requests'
    });
  }

  // Middleware for webhook authentication
  authenticateWebhook(provider) {
    return (req, res, next) => {
      try {
        const signature = this.extractSignature(req, provider);
        const secret = this.webhookSecrets[provider];

        if (!secret) {
          return res.status(500).json({ error: 'Webhook secret not configured' });
        }

        if (!this.verifySignature(req.body, signature, secret, provider)) {
          return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        // Log successful webhook authentication
        this.logWebhookAuth(provider, req.ip, true);
        next();
        
      } catch (error) {
        this.logWebhookAuth(provider, req.ip, false, error.message);
        return res.status(401).json({ error: 'Webhook authentication failed' });
      }
    };
  }

  extractSignature(req, provider) {
    switch (provider) {
      case 'stripe':
        return req.headers['stripe-signature'];
      case 'github':
        return req.headers['x-hub-signature-256'];
      case 'sendgrid':
        return req.headers['x-twilio-email-event-webhook-signature'];
      default:
        throw new Error(`Unknown webhook provider: ${provider}`);
    }
  }

  verifySignature(payload, signature, secret, provider) {
    switch (provider) {
      case 'stripe':
        return this.verifyStripeSignature(payload, signature, secret);
      case 'github':
        return this.verifyGitHubSignature(payload, signature, secret);
      case 'sendgrid':
        return this.verifySendGridSignature(payload, signature, secret);
      default:
        return false;
    }
  }

  verifyStripeSignature(payload, signature, secret) {
    const elements = signature.split(',');
    const signatureElements = {};

    elements.forEach(element => {
      const [key, value] = element.split('=');
      signatureElements[key] = value;
    });

    const timestamp = signatureElements.t;
    const signatures = [signatureElements.v1];

    // Check if timestamp is recent (within 5 minutes)
    const timestampDiff = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (timestampDiff > 300) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');

    return signatures.some(signature => 
      crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )
    );
  }

  verifyGitHubSignature(payload, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');

    return crypto.timingSafeEqual(
      Buffer.from(providedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  verifySendGridSignature(payload, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64');

    return signature === expectedSignature;
  }

  // Webhook processing with error handling
  processWebhook(handler) {
    return async (req, res) => {
      const startTime = Date.now();
      
      try {
        const result = await handler(req.body, req.headers);
        
        const processingTime = Date.now() - startTime;
        this.logWebhookProcessing(req, processingTime, true);
        
        res.status(200).json(result || { received: true });
        
      } catch (error) {
        const processingTime = Date.now() - startTime;
        this.logWebhookProcessing(req, processingTime, false, error.message);
        
        res.status(500).json({ 
          error: 'Webhook processing failed',
          message: error.message 
        });
      }
    };
  }

  logWebhookAuth(provider, ip, success, error = null) {
    const logData = {
      type: 'webhook_auth',
      provider,
      ip,
      success,
      timestamp: new Date().toISOString()
    };

    if (error) {
      logData.error = error;
    }

    console.log('Webhook Authentication:', logData);
  }

  logWebhookProcessing(req, processingTime, success, error = null) {
    const logData = {
      type: 'webhook_processing',
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      processingTime,
      success,
      timestamp: new Date().toISOString()
    };

    if (error) {
      logData.error = error;
    }

    console.log('Webhook Processing:', logData);
  }
}

module.exports = WebhookSecurity;
```

## 🔗 **Integration with Factory**

### **Connects With**
- **SECURITY/**: Secure integration patterns and authentication
- **MONITORING/**: Integration monitoring and observability
- **AUTOMATION/**: Automated integration testing and deployment
- **TESTING/**: Integration testing frameworks and validation

### **Supports**
- **Rapid Development**: Pre-built integration templates
- **Reliability**: Error handling and retry mechanisms
- **Security**: Secure authentication and data handling
- **Scalability**: Rate limiting and performance optimization

## 💡 **Pro Tips**

### **Integration Development**
- Always implement proper error handling and retry logic
- Use environment variables for all configuration
- Implement comprehensive logging for debugging
- Add health checks for all external services

### **Security Best Practices**
- Validate all incoming webhook signatures
- Use least-privilege access for API keys
- Implement rate limiting on all endpoints
- Log security events for monitoring

### **Performance Optimization**
- Implement connection pooling for frequently used services
- Use caching where appropriate
- Monitor API usage and costs
- Implement circuit breakers for external services

---

*Seamless Integrations | Secure Connections | Reliable Operations*