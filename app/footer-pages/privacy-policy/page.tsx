import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="client-page footer-page">
      <header className="client-page__header">
        <h1 className="client-page__title">Privacy Policy</h1>
      </header>

        <section className="client-page__sections">
          {/* Section 1: Introduction */}
          <div className="client-card">
            <h2 className="client-card__section-title">1. Introduction and Scope</h2>
            <div className="client-card__content">
              <p>
                PulseLedger is a comprehensive health management and coaching platform connecting certified health coaches with clients seeking personalized fitness, nutrition, and wellness guidance. This Privacy Policy applies to all users of our Service, including:
              </p>
              <ul className="client-list">
                <li><strong>Clients:</strong> Individuals seeking health and fitness coaching services</li>
                <li><strong>Coaches:</strong> Certified health and fitness professionals providing coaching services</li>
                <li><strong>Administrators:</strong> Platform administrators managing the Service</li>
                <li><strong>Visitors:</strong> Anyone browsing our website or public content</li>
              </ul>
              <p>
                We are committed to protecting your privacy and handling your personal information with the highest standards of security and transparency. This policy complies with applicable data protection laws, including the General Data Protection Regulation (GDPR) for users in the European Economic Area (EEA), the California Consumer Privacy Act (CCPA), and other relevant regulations.
              </p>
            </div>
          </div>

          {/* Section 2: Information We Collect */}
          <div className="client-card">
            <h2 className="client-card__section-title">2. Information We Collect</h2>
            <div className="client-card__content">
              <p>We collect various types of information to provide and improve our Service:</p>
              
              <h3 className="client-card__subsection-title">2.1 Personal Identification Information</h3>
              <ul className="client-list">
                <li><strong>Account Information:</strong> Full name, email address, password (encrypted), phone number, WhatsApp number</li>
                <li><strong>Profile Information:</strong> Profile photo/avatar, address details (street address, neighborhood, city, state, postal code, country)</li>
                <li><strong>Role-Specific Information:</strong> User role (client, coach, or admin), coach referral codes, client-coach assignments</li>
                <li><strong>Coach Professional Information:</strong> Specialization, years of experience, professional description, certifications, awards, transformation portfolio images</li>
                <li><strong>Social Media Links:</strong> Instagram, Facebook, Twitter, LinkedIn, YouTube, and personal website URLs (for coaches)</li>
              </ul>

              <h3 className="client-card__subsection-title">2.2 Health and Wellness Data</h3>
              <ul className="client-list">
                <li><strong>Biometric Data:</strong> Weight, height, Body Mass Index (BMI), and historical tracking of these metrics</li>
                <li><strong>Progress Tracking:</strong> Water intake logs, progress notes, progress photographs with captions, and timestamp data</li>
                <li><strong>Personal Health Goals:</strong> Fitness objectives, wellness targets, and plan-specific goals</li>
                <li><strong>Contact Request Data:</strong> Age, gender, current weight, height, health concerns, and personal messages submitted through contact forms</li>
              </ul>

              <h3 className="client-card__subsection-title">2.3 Service Usage Data</h3>
              <ul className="client-list">
                <li><strong>Coaching Plans:</strong> Plan titles, descriptions, duration, tasks, completion status, start and end dates</li>
                <li><strong>Subscriptions:</strong> Subscription status, payment amounts, duration (typically 1-52 weeks), plan details, approval status</li>
                <li><strong>Plan Requests:</strong> Client requests to join specific coaching plans, request status, and related communications</li>
                <li><strong>Product Interactions:</strong> Products browsed, added to cart, or purchased, including product names, descriptions, prices, categories, and images</li>
                <li><strong>Orders:</strong> Order history, items purchased, quantities, pricing, discount information, voucher codes applied, payment proof uploads, payment mode, order status, and notes</li>
                <li><strong>Notifications:</strong> In-app notifications including system alerts, order updates, plan notifications, and read status</li>
              </ul>

              <h3 className="client-card__subsection-title">2.4 Payment Information</h3>
              <ul className="client-list">
                <li><strong>Transaction Data:</strong> Payment amounts, transaction dates, payment modes (manual QR code, cash, other)</li>
                <li><strong>Payment Proof:</strong> Images of payment confirmations or transaction receipts uploaded by users</li>
                <li><strong>Coach Payment Details:</strong> QR codes for UPI or manual payments (stored securely)</li>
                <li><strong>Platform Subscription Payments (Coaches):</strong> Platform subscription fees, payment history, transaction IDs, approval status, subscription validity periods, and payment proof screenshots</li>
                <li><strong>Admin Payment QR:</strong> QR code uploaded by administrators for coach platform subscription payments</li>
                <li><strong>Note:</strong> We do not directly process or store sensitive payment card information. Payment processing is handled through secure third-party payment processors who comply with PCI DSS standards.</li>
              </ul>

              <h3 className="client-card__subsection-title">2.5 Technical and Usage Data</h3>
              <ul className="client-list">
                <li><strong>Authentication Data:</strong> JWT access tokens (short-lived), refresh tokens (stored securely), login timestamps, session information</li>
                <li><strong>Device Information:</strong> IP address, browser type and version, operating system, device identifiers</li>
                <li><strong>Usage Patterns:</strong> Pages visited, features used, time spent on platform, click patterns, navigation paths</li>
                <li><strong>Log Data:</strong> Server logs, error logs, access logs, and performance monitoring data</li>
                <li><strong>Cookies and Similar Technologies:</strong> Session cookies, authentication cookies (HTTP-only), preference cookies, analytics cookies</li>
              </ul>

              <h3 className="client-card__subsection-title">2.6 Communications Data</h3>
              <ul className="client-list">
                <li><strong>Messages:</strong> Communications between clients and coaches, customer support inquiries, feedback submissions, bug reports</li>
                <li><strong>Contact Requests:</strong> Information submitted through contact forms, including personal messages and health information</li>
                <li><strong>Email Communications:</strong> Records of emails sent and received related to your account and services</li>
              </ul>

              <h3 className="client-card__subsection-title">2.7 User-Generated Content</h3>
              <ul className="client-list">
                <li><strong>Photos and Images:</strong> Profile avatars, progress photos, coach portfolios (awards, certifications, transformation results), product images</li>
                <li><strong>Text Content:</strong> Notes, descriptions, captions, feedback, reviews, and comments</li>
                <li><strong>All user-uploaded content</strong> is stored securely using Cloudinary, a third-party cloud storage service, and is protected with appropriate access controls</li>
              </ul>
            </div>
          </div>

          {/* Section 3: How We Collect Information */}
          <div className="client-card">
            <h2 className="client-card__section-title">3. How We Collect Information</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">3.1 Information You Provide Directly</h3>
              <ul className="client-list">
                <li>When you create an account or register for our Service</li>
                <li>When you complete your profile or update your information</li>
                <li>When you purchase products, subscribe to plans, or place orders</li>
                <li>When you upload photos, enter health data, or log progress</li>
                <li>When you submit contact forms, feedback, or support requests</li>
                <li>When you communicate with coaches or our support team</li>
                <li>When you participate in surveys, promotions, or events</li>
              </ul>

              <h3 className="client-card__subsection-title">3.2 Information Collected Automatically</h3>
              <ul className="client-list">
                <li><strong>Cookies and Tracking Technologies:</strong> We use HTTP-only cookies for authentication and session management, and analytics cookies to understand how users interact with our Service</li>
                <li><strong>Server Logs:</strong> Our servers automatically record information when you access our Service, including your IP address, browser type, referring URLs, and pages accessed</li>
                <li><strong>Authentication Systems:</strong> Login times, token refresh events, logout events, and security-related activities</li>
              </ul>

              <h3 className="client-card__subsection-title">3.3 Information from Third Parties</h3>
              <ul className="client-list">
                <li><strong>Payment Processors:</strong> Transaction confirmation data (we do not receive full payment card details)</li>
                <li><strong>Cloud Storage Providers:</strong> Cloudinary provides secure image hosting and delivery services</li>
                <li><strong>Analytics Services:</strong> Aggregated usage statistics and performance metrics</li>
                <li><strong>Referrals:</strong> Information provided by other users when they refer you to the platform using coach referral codes</li>
              </ul>
            </div>
          </div>

          {/* Section 4: How We Use Your Information */}
          <div className="client-card">
            <h2 className="client-card__section-title">4. How We Use Your Information</h2>
            <div className="client-card__content">
              <p>We use the collected information for the following purposes:</p>

              <h3 className="client-card__subsection-title">4.1 Service Delivery and Account Management</h3>
              <ul className="client-list">
                <li>Create, maintain, and secure your account</li>
                <li>Authenticate your identity and manage access to your account</li>
                <li>Match clients with appropriate coaches based on referral codes</li>
                <li>Enable coaches to manage their client relationships and provide services</li>
                <li>Process and fulfill subscriptions, orders, and product purchases</li>
                <li>Facilitate communication between clients and coaches</li>
                <li>Display your profile information to relevant users (coaches to their clients, public coach profiles)</li>
              </ul>

              <h3 className="client-card__subsection-title">4.2 Health and Fitness Services</h3>
              <ul className="client-list">
                <li>Enable progress tracking and health monitoring</li>
                <li>Allow coaches to create and manage personalized coaching plans</li>
                <li>Provide tools for logging weight, height, BMI, water intake, and other health metrics</li>
                <li>Store and display progress photos securely for client-coach review</li>
                <li>Generate progress reports and analytics</li>
                <li>Send reminders for progress logging and plan tasks</li>
              </ul>

              <h3 className="client-card__subsection-title">4.3 Payment and Transaction Processing</h3>
              <ul className="client-list">
                <li>Process payments for subscriptions, products, and services</li>
                <li>Process platform subscription fees for coaches (₹99 monthly fee with 28-day free trial)</li>
                <li>Verify payment proofs and transaction authenticity for all payment types</li>
                <li>Track coach platform subscription status (trial, active, expired, suspended)</li>
                <li>Send notifications about platform subscription expiry and payment reminders</li>
                <li>Apply discount vouchers and calculate pricing</li>
                <li>Manage subscription billing cycles and renewals</li>
                <li>Handle refunds and payment disputes</li>
                <li>Maintain transaction records for accounting and legal purposes</li>
              </ul>

              <h3 className="client-card__subsection-title">4.4 Communication and Notifications</h3>
              <ul className="client-list">
                <li>Send transactional emails and notifications about your account</li>
                <li>Notify you about order updates, subscription changes, and plan approvals</li>
                <li>Send system notifications about platform updates or important changes</li>
                <li>Respond to your inquiries, support requests, and feedback</li>
                <li>Send promotional communications about new features or services (with your consent)</li>
              </ul>

              <h3 className="client-card__subsection-title">4.5 Platform Improvement and Analytics</h3>
              <ul className="client-list">
                <li>Analyze usage patterns to improve user experience and platform performance</li>
                <li>Identify and fix technical issues, bugs, and errors</li>
                <li>Conduct research and development for new features</li>
                <li>Generate aggregated statistics and insights for business intelligence</li>
                <li>Optimize platform security and prevent fraud</li>
              </ul>

              <h3 className="client-card__subsection-title">4.6 Security and Fraud Prevention</h3>
              <ul className="client-list">
                <li>Detect, prevent, and investigate fraud, abuse, and security incidents</li>
                <li>Implement rate limiting to prevent spam and automated attacks</li>
                <li>Monitor for suspicious activities and unauthorized access attempts</li>
                <li>Enforce our Terms of Service and other policies</li>
                <li>Protect the rights, property, and safety of PulseLedger, our users, and the public</li>
              </ul>

              <h3 className="client-card__subsection-title">4.7 Legal Compliance and Protection</h3>
              <ul className="client-list">
                <li>Comply with applicable laws, regulations, and legal processes</li>
                <li>Respond to lawful requests from government authorities</li>
                <li>Enforce our legal rights and defend against legal claims</li>
                <li>Maintain records required by law for tax, accounting, and regulatory purposes</li>
              </ul>

              <h3 className="client-card__subsection-title">4.8 Business Operations</h3>
              <ul className="client-list">
                <li>Provide administrative dashboards for coaches and admins</li>
                <li>Generate reports on platform performance, user statistics, and business metrics</li>
                <li>Facilitate business analysis and strategic planning</li>
                <li>Support potential business transitions, including mergers or acquisitions</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Legal Basis for Processing */}
          <div className="client-card">
            <h2 className="client-card__section-title">5. Legal Basis for Processing (GDPR)</h2>
            <div className="client-card__content">
              <p>For users in the European Economic Area (EEA), United Kingdom, or other jurisdictions with similar data protection laws, we process your personal data based on the following legal grounds:</p>

              <h3 className="client-card__subsection-title">5.1 Contractual Necessity</h3>
              <p>Processing is necessary to perform our contract with you and provide the Service you requested, including:</p>
              <ul className="client-list">
                <li>Account creation and management</li>
                <li>Coaching services delivery</li>
                <li>Subscription and order processing</li>
                <li>Client-coach matching and communication</li>
              </ul>

              <h3 className="client-card__subsection-title">5.2 Legitimate Interests</h3>
              <p>Processing is necessary for our legitimate business interests, such as:</p>
              <ul className="client-list">
                <li>Improving and developing our Service</li>
                <li>Analyzing usage patterns and platform performance</li>
                <li>Fraud prevention and security</li>
                <li>Direct marketing (where not requiring consent)</li>
                <li>Business intelligence and strategic planning</li>
              </ul>

              <h3 className="client-card__subsection-title">5.3 Consent</h3>
              <p>Where required by law, we obtain your explicit consent before processing, including:</p>
              <ul className="client-list">
                <li>Processing sensitive health data beyond what's necessary for service delivery</li>
                <li>Sending marketing communications</li>
                <li>Using non-essential cookies and tracking technologies</li>
                <li>Sharing data with third parties for marketing purposes</li>
              </ul>

              <h3 className="client-card__subsection-title">5.4 Legal Obligations</h3>
              <p>Processing is necessary to comply with legal obligations, such as:</p>
              <ul className="client-list">
                <li>Tax and accounting record-keeping</li>
                <li>Responding to lawful requests from authorities</li>
                <li>Regulatory compliance requirements</li>
              </ul>

              <h3 className="client-card__subsection-title">5.5 Vital Interests</h3>
              <p>In rare cases, processing may be necessary to protect the vital interests of you or another person, such as in medical emergencies.</p>
            </div>
          </div>

          {/* Section 6: How We Share Your Information */}
          <div className="client-card">
            <h2 className="client-card__section-title">6. How We Share Your Information</h2>
            <div className="client-card__content">
              <p><strong>IMPORTANT: We do not sell, rent, or trade your personal information to third parties for commercial purposes. We do not engage in data brokerage or sell user data to advertisers, marketers, or any other third parties.</strong> We may share your information only in the following limited circumstances:</p>

              <h3 className="client-card__subsection-title">6.1 Within the Platform</h3>
              <ul className="client-list">
                <li><strong>Client-Coach Relationship:</strong> Clients' health data, progress logs, and subscription information are shared with their assigned coach to enable coaching services</li>
                <li><strong>Public Coach Profiles:</strong> Coach professional information, specialization, experience, portfolio images, and reviews are publicly visible to help clients find coaches</li>
                <li><strong>Administrators:</strong> Platform administrators can access user data as necessary for platform management, support, and compliance purposes</li>
              </ul>

              <h3 className="client-card__subsection-title">6.2 Service Providers and Partners</h3>
              <ul className="client-list">
                <li><strong>Cloud Storage:</strong> Cloudinary stores and delivers images (avatars, progress photos, product images, coach portfolios) on our behalf</li>
                <li><strong>Database Hosting:</strong> MongoDB hosts our database infrastructure</li>
                <li><strong>Email Services:</strong> Email service providers send transactional and notification emails</li>
                <li><strong>Analytics Providers:</strong> We may use analytics services to understand platform usage (data is anonymized where possible)</li>
                <li><strong>Payment Processors:</strong> Secure payment processors handle payment transactions (we do not receive full payment card details)</li>
              </ul>
              <p>All service providers are contractually obligated to protect your data and use it only for the purposes we specify. <strong>We do not permit service providers to sell or use your data for their own commercial purposes.</strong></p>

              <h3 className="client-card__subsection-title">6.3 Legal Requirements and Protection</h3>
              <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities, including to:</p>
              <ul className="client-list">
                <li>Comply with legal obligations, court orders, or government requests</li>
                <li>Enforce our Terms of Service and other agreements</li>
                <li>Protect the rights, property, or safety of PulseLedger, our users, or the public</li>
                <li>Detect, prevent, or address fraud, security, or technical issues</li>
                <li>Investigate potential violations of our policies</li>
              </ul>

              <h3 className="client-card__subsection-title">6.4 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your personal information may be transferred as part of the business transaction. We will notify you via email and/or prominent notice on our Service of any change in ownership or use of your personal information, as well as any choices you may have regarding your information.
              </p>

              <h3 className="client-card__subsection-title">6.5 Aggregated or Anonymized Data</h3>
              <p>
                We may share aggregated or anonymized data that cannot reasonably be used to identify you. This includes statistical information about platform usage, trends, and demographics for business analysis, research, or marketing purposes.
              </p>

              <h3 className="client-card__subsection-title">6.6 With Your Consent</h3>
              <p>
                We may share your information with third parties when we have your explicit consent to do so.
              </p>
            </div>
          </div>

          {/* Section 7: Data Security */}
          <div className="client-card">
            <h2 className="client-card__section-title">7. Data Security and Protection</h2>
            <div className="client-card__content">
              <p>We implement comprehensive security measures to protect your personal information:</p>

              <h3 className="client-card__subsection-title">7.1 Technical Security Measures</h3>
              <ul className="client-list">
                <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL protocols (HTTPS)</li>
                <li><strong>Password Security:</strong> Passwords are hashed using bcrypt with a minimum of 10 salt rounds before storage; we never store passwords in plain text</li>
                <li><strong>Authentication Tokens:</strong> We use JWT (JSON Web Tokens) with short expiration times (15 minutes for access tokens) and secure refresh token rotation</li>
                <li><strong>HTTP-Only Cookies:</strong> Authentication cookies are HTTP-only, preventing JavaScript access and mitigating XSS attacks</li>
                <li><strong>HTTPS Enforcement:</strong> All production traffic is served over HTTPS only</li>
              </ul>

              <h3 className="client-card__subsection-title">7.2 Application Security</h3>
              <ul className="client-list">
                <li><strong>Input Validation:</strong> All user inputs are validated using Joi schemas to prevent malicious data entry</li>
                <li><strong>Sanitization:</strong> User-provided data is sanitized to prevent XSS (Cross-Site Scripting) and NoSQL injection attacks</li>
                <li><strong>Rate Limiting:</strong> We implement rate limiting to prevent brute-force attacks, spam, and abuse (100 requests per 15 minutes for general API, 50 attempts per 10 minutes for authentication)</li>
                <li><strong>CSRF Protection:</strong> Critical operations require authorization headers that cannot be automatically included in cross-site requests</li>
                <li><strong>Security Headers:</strong> We implement Helmet.js for security headers including Content Security Policy, X-Frame-Options, and referrer policies</li>
              </ul>

              <h3 className="client-card__subsection-title">7.3 Access Controls</h3>
              <ul className="client-list">
                <li><strong>Role-Based Access:</strong> Users can only access data appropriate to their role (client, coach, or admin)</li>
                <li><strong>Data Isolation:</strong> Coaches can only access data for their assigned clients; clients can only access their own data</li>
                <li><strong>Session Management:</strong> Secure session handling with refresh token rotation and multi-device logout capabilities</li>
                <li><strong>Restricted Access:</strong> Access to sensitive data and administrative functions is strictly limited to authorized personnel</li>
              </ul>

              <h3 className="client-card__subsection-title">7.4 Infrastructure Security</h3>
              <ul className="client-list">
                <li><strong>Secure Database:</strong> MongoDB database is protected with authentication, network restrictions, and encryption at rest</li>
                <li><strong>Cloud Storage:</strong> Cloudinary provides secure image storage with access controls and automatic metadata stripping</li>
                <li><strong>Server Security:</strong> Servers are configured with security best practices, regular updates, and monitoring</li>
                <li><strong>Environment Isolation:</strong> Production, staging, and development environments are strictly separated</li>
              </ul>

              <h3 className="client-card__subsection-title">7.5 Operational Security</h3>
              <ul className="client-list">
                <li><strong>Regular Security Audits:</strong> We conduct periodic security reviews and vulnerability assessments</li>
                <li><strong>Error Handling:</strong> Errors are logged securely without exposing sensitive information in production</li>
                <li><strong>Monitoring:</strong> We monitor for suspicious activities, unauthorized access attempts, and security incidents</li>
                <li><strong>Incident Response:</strong> We maintain an incident response plan for security breaches</li>
              </ul>

              <h3 className="client-card__subsection-title">7.6 Data Backup and Recovery</h3>
              <ul className="client-list">
                <li>Regular automated backups of all critical data</li>
                <li>Secure backup storage with encryption</li>
                <li>Disaster recovery procedures to minimize data loss</li>
                <li>Business continuity planning for service interruptions</li>
              </ul>

              <h3 className="client-card__subsection-title">7.7 Limitations</h3>
              <p>
                While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we are committed to protecting your data to the best of our ability. In the event of a data breach, we will notify affected users as required by applicable law.
              </p>
            </div>
          </div>

          {/* Section 8: Data Retention */}
          <div className="client-card">
            <h2 className="client-card__section-title">8. Data Retention</h2>
            <div className="client-card__content">
              <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>

              <h3 className="client-card__subsection-title">8.1 Active Account Data</h3>
              <ul className="client-list">
                <li><strong>Account Information:</strong> Retained for the duration of your active account</li>
                <li><strong>Health and Progress Data:</strong> Retained to provide continuous coaching services and track long-term progress</li>
                <li><strong>Coaching Plans and Subscriptions:</strong> Retained for the subscription period and for historical reference</li>
                <li><strong>Orders and Transactions:</strong> Retained for accounting, tax, and legal compliance purposes (typically 7 years)</li>
              </ul>

              <h3 className="client-card__subsection-title">8.2 Closed Account Data</h3>
              <ul className="client-list">
                <li>When you close your account or request deletion, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal, tax, audit, or fraud prevention purposes</li>
                <li>Some information may be retained in backup systems for up to 90 days before permanent deletion</li>
                <li>Transaction records may be retained longer for compliance with financial regulations</li>
              </ul>

              <h3 className="client-card__subsection-title">8.3 Authentication Data</h3>
              <ul className="client-list">
                <li><strong>Access Tokens:</strong> Expire automatically after 15 minutes</li>
                <li><strong>Refresh Tokens:</strong> Expire after 7 days or upon logout; immediately deleted upon logout</li>
                <li><strong>Session Logs:</strong> Retained for 90 days for security monitoring</li>
              </ul>

              <h3 className="client-card__subsection-title">8.4 Communications and Support</h3>
              <ul className="client-list">
                <li><strong>Customer Support Records:</strong> Retained for 3 years to improve service quality</li>
                <li><strong>Feedback and Bug Reports:</strong> Retained for 2 years or until resolved</li>
                <li><strong>Marketing Communications:</strong> Retained until you unsubscribe or for 2 years of inactivity</li>
              </ul>

              <h3 className="client-card__subsection-title">8.5 Legal and Compliance Data</h3>
              <ul className="client-list">
                <li>Data required for legal, regulatory, tax, or accounting purposes is retained for the period mandated by applicable law (typically 7-10 years for financial records)</li>
                <li>Data related to disputes, claims, or litigation is retained until the matter is fully resolved</li>
              </ul>

              <h3 className="client-card__subsection-title">8.6 Anonymized Data</h3>
              <p>
                We may retain anonymized or aggregated data indefinitely for analytics, research, and business intelligence purposes, as this data cannot be used to identify you personally.
              </p>
            </div>
          </div>

          {/* Section 9: Your Rights and Choices */}
          <div className="client-card">
            <h2 className="client-card__section-title">9. Your Rights and Choices</h2>
            <div className="client-card__content">
              <p>You have various rights regarding your personal information, depending on your location:</p>

              <h3 className="client-card__subsection-title">9.1 Access and Portability</h3>
              <ul className="client-list">
                <li><strong>Right to Access:</strong> You can request a copy of the personal information we hold about you</li>
                <li><strong>Right to Data Portability:</strong> You can request your data in a structured, commonly used, machine-readable format</li>
                <li><strong>How to Exercise:</strong> Log in to your account to view and download your data, or contact us at mail.pulseledger@gmail.com</li>
              </ul>

              <h3 className="client-card__subsection-title">9.2 Correction and Update</h3>
              <ul className="client-list">
                <li><strong>Right to Rectification:</strong> You can correct inaccurate or incomplete personal information</li>
                <li><strong>How to Exercise:</strong> Update your profile information directly in your account settings, or contact us for assistance</li>
              </ul>

              <h3 className="client-card__subsection-title">9.3 Deletion and Erasure</h3>
              <ul className="client-list">
                <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request deletion of your personal information</li>
                <li><strong>Limitations:</strong> We may retain certain information where required by law or for legitimate business purposes (e.g., fraud prevention, legal compliance)</li>
                <li><strong>How to Exercise:</strong> Contact us at mail.pulseledger@gmail.com with a deletion request; we will respond within 30 days</li>
              </ul>

              <h3 className="client-card__subsection-title">9.4 Restriction and Objection</h3>
              <ul className="client-list">
                <li><strong>Right to Restrict Processing:</strong> You can request that we limit how we use your data</li>
                <li><strong>Right to Object:</strong> You can object to processing based on legitimate interests or for direct marketing purposes</li>
                <li><strong>How to Exercise:</strong> Contact us at mail.pulseledger@gmail.com specifying your request</li>
              </ul>

              <h3 className="client-card__subsection-title">9.5 Consent Withdrawal</h3>
              <ul className="client-list">
                <li><strong>Right to Withdraw Consent:</strong> Where we rely on consent, you can withdraw it at any time</li>
                <li><strong>Effect:</strong> Withdrawal does not affect the lawfulness of processing before withdrawal</li>
                <li><strong>How to Exercise:</strong> Update your preferences in account settings or contact us</li>
              </ul>

              <h3 className="client-card__subsection-title">9.6 Marketing Communications</h3>
              <ul className="client-list">
                <li><strong>Opt-Out:</strong> You can unsubscribe from marketing emails using the unsubscribe link in any marketing email</li>
                <li><strong>Transactional Emails:</strong> You cannot opt out of service-related emails (e.g., order confirmations, security alerts) while using the Service</li>
              </ul>

              <h3 className="client-card__subsection-title">9.7 Cookie Management</h3>
              <ul className="client-list">
                <li><strong>Essential Cookies:</strong> Required for authentication and platform functionality; cannot be disabled while using the Service</li>
                <li><strong>Analytics Cookies:</strong> Can be managed through browser settings</li>
                <li><strong>Browser Controls:</strong> Most browsers allow you to refuse or delete cookies through settings</li>
              </ul>

              <h3 className="client-card__subsection-title">9.8 Account Deactivation</h3>
              <ul className="client-list">
                <li>You can deactivate your account, which will prevent login but retain your data for a period</li>
                <li>Contact us to permanently delete your account and data (subject to legal retention requirements)</li>
              </ul>

              <h3 className="client-card__subsection-title">9.9 California Privacy Rights (CCPA)</h3>
              <p>If you are a California resident, you have additional rights under the CCPA:</p>
              <ul className="client-list">
                <li><strong>Right to Know:</strong> Request disclosure of personal information collected, used, and shared</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information (subject to exceptions)</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of the "sale" of personal information (note: we do not sell personal information)</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
                <li><strong>Authorized Agents:</strong> You may designate an authorized agent to make requests on your behalf</li>
              </ul>

              <h3 className="client-card__subsection-title">9.10 EEA and UK Rights (GDPR)</h3>
              <p>If you are in the EEA or UK, you have rights under GDPR including:</p>
              <ul className="client-list">
                <li>Right to lodge a complaint with your local supervisory authority</li>
                <li>Right to an explanation of automated decision-making (if applicable)</li>
                <li>Right to restrict processing during disputes</li>
              </ul>

              <h3 className="client-card__subsection-title">9.11 How to Exercise Your Rights</h3>
              <p>To exercise any of these rights, please contact us at:</p>
              <ul className="client-list">
                <li><strong>Email:</strong> mail.pulseledger@gmail.com</li>
                <li><strong>Subject Line:</strong> "Privacy Rights Request"</li>
                <li><strong>Include:</strong> Your full name, email address, account details, and specific request</li>
              </ul>
              <p>
                We will respond to your request within 30 days (or as required by applicable law). We may need to verify your identity before processing your request to protect your personal information.
              </p>
            </div>
          </div>

          {/* Section 10: Cookies and Tracking */}
          <div className="client-card">
            <h2 className="client-card__section-title">10. Cookies and Tracking Technologies</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">10.1 What Are Cookies</h3>
              <p>
                Cookies are small text files stored on your device when you visit our Service. We use cookies and similar technologies to enhance your experience, maintain sessions, and analyze usage.
              </p>

              <h3 className="client-card__subsection-title">10.2 Types of Cookies We Use</h3>
              
              <h4><strong>Essential Cookies (Required)</strong></h4>
              <ul className="client-list">
                <li><strong>Authentication Cookies:</strong> HTTP-only refresh token cookie that maintains your login session (expires after 7 days or on logout)</li>
                <li><strong>Security Cookies:</strong> Used to detect and prevent security risks</li>
                <li><strong>Purpose:</strong> These cookies are necessary for the Service to function and cannot be disabled</li>
              </ul>

              <h4><strong>Functional Cookies</strong></h4>
              <ul className="client-list">
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Purpose:</strong> Enhance your user experience by remembering your choices</li>
              </ul>

              <h4><strong>Analytics Cookies (Optional)</strong></h4>
              <ul className="client-list">
                <li><strong>Usage Analytics:</strong> Help us understand how users interact with our Service</li>
                <li><strong>Performance Monitoring:</strong> Identify technical issues and optimize performance</li>
                <li><strong>Purpose:</strong> Improve our Service and user experience</li>
              </ul>

              <h3 className="client-card__subsection-title">10.3 Cookie Attributes</h3>
              <ul className="client-list">
                <li><strong>HttpOnly:</strong> Authentication cookies are HTTP-only, preventing JavaScript access and protecting against XSS attacks</li>
                <li><strong>Secure:</strong> In production, cookies are only transmitted over HTTPS</li>
                <li><strong>SameSite:</strong> Set to 'Lax' in development and 'None' (with Secure) in production for cross-origin requests</li>
              </ul>

              <h3 className="client-card__subsection-title">10.4 Session Storage and Local Storage</h3>
              <ul className="client-list">
                <li>We may use browser storage (localStorage or sessionStorage) for temporary data and application state</li>
                <li>No sensitive personal information or authentication credentials are stored in browser storage</li>
                <li>This data is stored locally on your device and is not transmitted to our servers automatically</li>
              </ul>

              <h3 className="client-card__subsection-title">10.5 Third-Party Cookies</h3>
              <ul className="client-list">
                <li><strong>Cloudinary:</strong> May set cookies for image delivery optimization</li>
                <li><strong>Analytics Services:</strong> May use cookies to track aggregated usage (if implemented)</li>
                <li>We do not control third-party cookies and recommend reviewing their privacy policies</li>
              </ul>

              <h3 className="client-card__subsection-title">10.6 Managing Cookies</h3>
              <ul className="client-list">
                <li><strong>Browser Settings:</strong> You can configure your browser to refuse all cookies or alert you when cookies are being sent</li>
                <li><strong>Impact:</strong> Disabling essential cookies will prevent you from using certain features or may prevent login</li>
                <li><strong>Browser Help:</strong> Consult your browser's help documentation for specific instructions</li>
              </ul>

              <h3 className="client-card__subsection-title">10.7 Do Not Track</h3>
              <p>
                Some browsers offer a "Do Not Track" (DNT) signal. Currently, there is no industry consensus on how to respond to DNT signals. We do not currently respond to DNT browser signals but will update this policy if standards emerge.
              </p>
            </div>
          </div>

          {/* Section 11: International Data Transfers */}
          <div className="client-card">
            <h2 className="client-card__section-title">11. International Data Transfers</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">11.1 Data Location</h3>
              <p>
                Your personal information may be transferred to, stored, and processed in countries other than your country of residence. These countries may have data protection laws that differ from the laws of your country.
              </p>

              <h3 className="client-card__subsection-title">11.2 Cloud Infrastructure</h3>
              <ul className="client-list">
                <li><strong>Database:</strong> MongoDB Atlas may store data in various global regions</li>
                <li><strong>Image Storage:</strong> Cloudinary uses a global CDN for image delivery and storage</li>
                <li><strong>Application Servers:</strong> Hosted in data centers that may be located in different countries</li>
              </ul>

              <h3 className="client-card__subsection-title">11.3 Safeguards for International Transfers</h3>
              <ul className="client-list">
                <li>We ensure that all international data transfers are protected by appropriate safeguards, including:
                  <ul className="client-list">
                    <li>Standard contractual clauses approved by relevant authorities</li>
                    <li>Adequacy decisions recognizing equivalent data protection</li>
                    <li>Binding corporate rules for service providers</li>
                    <li>Compliance with Privacy Shield principles (where applicable)</li>
                  </ul>
                </li>
              </ul>

              <h3 className="client-card__subsection-title">11.4 EEA and UK Users</h3>
              <p>
                For users in the European Economic Area (EEA) or United Kingdom, we take additional measures to ensure your data receives an equivalent level of protection when transferred outside the EEA/UK. You may contact us to obtain more information about the specific mechanism used for your data transfers.
              </p>
            </div>
          </div>

          {/* Section 12: Children's Privacy */}
          <div className="client-card">
            <h2 className="client-card__section-title">12. Children's Privacy</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">12.1 Age Requirements</h3>
              <p>
                Our Service is not intended for children under the age of 13 (or 16 in the EEA). We do not knowingly collect personal information from children under these age limits.
              </p>

              <h3 className="client-card__subsection-title">12.2 Parental Consent</h3>
              <ul className="client-list">
                <li>Users between ages 13-18 (or 16-18 in the EEA) should use our Service only with parental or guardian consent</li>
                <li>Parents or guardians should supervise minors' use of the Service and their submission of personal information</li>
              </ul>

              <h3 className="client-card__subsection-title">12.3 Discovery of Children's Data</h3>
              <p>
                If we discover that we have collected personal information from a child under the applicable age limit without proper consent, we will take steps to delete that information as quickly as possible. If you believe we have collected information from a child improperly, please contact us immediately at mail.pulseledger@gmail.com.
              </p>

              <h3 className="client-card__subsection-title">12.4 COPPA Compliance</h3>
              <p>
                For users in the United States, we comply with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect, use, or disclose personal information from children under 13 without verifiable parental consent.
              </p>
            </div>
          </div>

          {/* Section 13: Third-Party Services */}
          <div className="client-card">
            <h2 className="client-card__section-title">13. Third-Party Services and Links</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">13.1 Third-Party Services We Use</h3>
              <ul className="client-list">
                <li><strong>Cloudinary:</strong> Image hosting, transformation, and CDN services (<a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>MongoDB Atlas:</strong> Database hosting and management (<a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>Email Service Providers:</strong> Transactional email delivery</li>
                <li><strong>Payment Processors:</strong> Secure payment processing (if integrated)</li>
              </ul>

              <h3 className="client-card__subsection-title">13.2 Third-Party Links</h3>
              <ul className="client-list">
                <li>Our Service may contain links to third-party websites, including:
                  <ul className="client-list">
                    <li>Coach social media profiles (Instagram, Facebook, Twitter, LinkedIn, YouTube)</li>
                    <li>Coach personal websites</li>
                    <li>External resources and references</li>
                  </ul>
                </li>
                <li>We are not responsible for the privacy practices of third-party websites</li>
                <li>We encourage you to review the privacy policies of any third-party sites you visit</li>
              </ul>

              <h3 className="client-card__subsection-title">13.3 Social Media Integration</h3>
              <ul className="client-list">
                <li>Coaches may display links to their social media profiles</li>
                <li>Clicking these links may allow those social networks to collect information about you</li>
                <li>We do not control what data social networks collect when you visit their sites</li>
              </ul>

              <h3 className="client-card__subsection-title">13.4 Our Responsibility</h3>
              <p>
                PulseLedger is not responsible for the content, privacy policies, or practices of third-party websites or services. Your interactions with third parties are governed solely by their terms and privacy policies.
              </p>
            </div>
          </div>

          {/* Section 14: Changes to Privacy Policy */}
          <div className="client-card">
            <h2 className="client-card__section-title">14. Changes to This Privacy Policy</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">14.1 Updates and Modifications</h3>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will:
              </p>
              <ul className="client-list">
                <li>Update the "Last Updated" date at the top of this policy</li>
                <li>Post the revised policy on this page</li>
                <li>Notify you of material changes through email or prominent notice on our Service</li>
              </ul>

              <h3 className="client-card__subsection-title">14.2 Material Changes</h3>
              <p>
                For material changes that significantly affect your rights or how we use your personal information, we will:
              </p>
              <ul className="client-list">
                <li>Provide at least 30 days' advance notice</li>
                <li>Seek your consent if required by law</li>
                <li>Provide clear information about the nature of the changes</li>
              </ul>

              <h3 className="client-card__subsection-title">14.3 Your Acceptance</h3>
              <ul className="client-list">
                <li>Continued use of the Service after changes become effective constitutes acceptance of the revised Privacy Policy</li>
                <li>If you do not agree with changes, you should discontinue use and may request deletion of your account</li>
              </ul>

              <h3 className="client-card__subsection-title">14.4 Review Responsibility</h3>
              <p>
                We encourage you to periodically review this Privacy Policy to stay informed about how we protect your information.
              </p>
            </div>
          </div>

          {/* Section 15: Contact Information */}
          <div className="client-card">
            <h2 className="client-card__section-title">15. Contact Us</h2>
            <div className="client-card__content">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>

              <h3 className="client-card__subsection-title">15.1 General Inquiries</h3>
              <ul className="client-list">
                <li><strong>Email:</strong> mail.pulseledger@gmail.com</li>
                <li><strong>Subject Line:</strong> "Privacy Policy Inquiry"</li>
                <li><strong>Response Time:</strong> We will respond to all inquiries within 5-7 business days</li>
              </ul>

              <h3 className="client-card__subsection-title">15.2 Privacy Rights Requests</h3>
              <ul className="client-list">
                <li><strong>Email:</strong> mail.pulseledger@gmail.com</li>
                <li><strong>Subject Line:</strong> "Privacy Rights Request"</li>
                <li><strong>Include:</strong> Full name, email address, account details, specific request, and identity verification information</li>
                <li><strong>Response Time:</strong> Within 30 days (or as required by applicable law)</li>
              </ul>

              <h3 className="client-card__subsection-title">15.3 Data Protection Officer</h3>
              <p>
                For users in the EEA, UK, or other jurisdictions requiring a Data Protection Officer (DPO), please direct inquiries to mail.pulseledger@gmail.com with "DPO" in the subject line.
              </p>

              <h3 className="client-card__subsection-title">15.4 Supervisory Authority</h3>
              <p>
                If you are located in the EEA or UK and believe we have not adequately addressed your concerns, you have the right to lodge a complaint with your local data protection supervisory authority.
              </p>

              <h3 className="client-card__subsection-title">15.5 Security Concerns</h3>
              <p>
                If you discover a security vulnerability or have security concerns, please email us immediately at mail.pulseledger@gmail.com with "Security Issue" in the subject line.
              </p>
            </div>
          </div>

          {/* Section 16: Additional Information */}
          <div className="client-card">
            <h2 className="client-card__section-title">16. Additional Information for Specific Jurisdictions</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">16.1 California Residents (CCPA/CPRA)</h3>
              <p><strong>Shine the Light Law:</strong> California residents may request information about our disclosure of personal information to third parties for direct marketing purposes. We do not share personal information with third parties for their direct marketing purposes.</p>
              <p><strong>Categories of Information:</strong> We collect the categories of personal information described in Section 2 of this policy.</p>
              <p><strong>No Sale of Data:</strong> We do not sell personal information as defined by California law.</p>

              <h3 className="client-card__subsection-title">16.2 Nevada Residents</h3>
              <p>
                Nevada residents may opt out of the "sale" of personal information. We do not sell personal information as defined under Nevada law. If you have questions, contact us at mail.pulseledger@gmail.com.
              </p>

              <h3 className="client-card__subsection-title">16.3 European Economic Area (EEA) and UK</h3>
              <ul className="client-list">
                <li><strong>Legal Basis:</strong> See Section 5 for detailed information on our legal basis for processing</li>
                <li><strong>Your Rights:</strong> See Section 9 for comprehensive information on your GDPR rights</li>
                <li><strong>Data Controller:</strong> PulseLedger acts as the data controller for personal information processed through the Service</li>
                <li><strong>International Transfers:</strong> See Section 11 for information on international data transfers</li>
              </ul>

              <h3 className="client-card__subsection-title">16.4 Australia</h3>
              <p>
                Australian users have rights under the Privacy Act 1988. You can access and correct your personal information, make complaints, and request information about our privacy practices by contacting us.
              </p>

              <h3 className="client-card__subsection-title">16.5 India - Primary Jurisdiction</h3>
              <p>
                <strong>PulseLedger operates primarily under Indian jurisdiction and complies with Indian data protection laws.</strong>
              </p>
              <ul className="client-list">
                <li>Given the nature of our health coaching services, we collect sensitive personal data as defined under Indian law (health information, biometric data). We implement reasonable security practices and procedures as required under the Information Technology Act, 2000 and the IT (Reasonable Security Practices) Rules, 2011</li>
                <li>We comply with the Consumer Protection Act, 2019 for consumer data rights</li>
                <li>Data may be stored with international cloud providers (MongoDB, Cloudinary) as permitted by Indian law</li>
                <li>Financial records are retained for 7 years in compliance with Indian tax and accounting regulations</li>
                <li><strong>We do not sell or trade personal data to third parties for commercial purposes</strong></li>
                <li>For data protection inquiries, contact us at mail.pulseledger@gmail.com</li>
              </ul>
            </div>
          </div>

          {/* Section 17: Definitions */}
          <div className="client-card">
            <h2 className="client-card__section-title">17. Definitions and Terms</h2>
            <div className="client-card__content">
              <ul className="client-list">
                <li><strong>"Personal Information"</strong> or <strong>"Personal Data"</strong>: Information that identifies, relates to, describes, or could reasonably be linked to you</li>
                <li><strong>"Processing"</strong>: Any operation performed on personal data, including collection, storage, use, disclosure, or deletion</li>
                <li><strong>"Service"</strong>: The PulseLedger platform, including website, applications, and all related services</li>
                <li><strong>"User"</strong>, <strong>"You"</strong>, <strong>"Your"</strong>: Any person who accesses or uses the Service</li>
                <li><strong>"We"</strong>, <strong>"Us"</strong>, <strong>"Our"</strong>: PulseLedger and its affiliates</li>
                <li><strong>"Coach"</strong>: Certified health and fitness professionals using the platform to provide services</li>
                <li><strong>"Client"</strong>: Individuals using the platform to receive coaching services</li>
                <li><strong>"Admin"</strong>: Platform administrators with elevated privileges</li>
                <li><strong>"Third Party"</strong>: Any entity other than you or PulseLedger</li>
              </ul>
            </div>
          </div>

          {/* Effective Date */}
          <div className="client-card client-card--date">
            <h2 className="client-card__section-title">Effective Date and Version</h2>
            <p><strong>Effective Date:</strong> November 22, 2025</p>
            <p><strong>Version:</strong> 2.1</p>
            <p><strong>Previous Version Date:</strong> November 20, 2025</p>
            <p className="mt-4">
              This Privacy Policy supersedes all previous versions. By continuing to use PulseLedger after the effective date, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </div>

          {/* Footer acknowledgment */}
          <div className="client-card">
            <div className="client-card__content">
              <p className="text-center">
                <strong>Thank you for trusting PulseLedger with your health and wellness journey.</strong>
              </p>
              <p className="text-center">
                We are committed to protecting your privacy and providing a secure, transparent platform for your fitness goals.
              </p>
            </div>
          </div>
        </section>
    </main>
  );
}
