import React from "react";

export default function TermsAndConditionsPage() {
  return (
    <main className="client-page footer-page">
      <header className="client-page__header">
        <h1 className="client-page__title">Terms and Conditions</h1>
      </header>

        <section className="client-page__sections">
          {/* Section 1: Agreement to Terms */}
          <div className="client-card">
            <h2 className="client-card__section-title">1. Agreement to Terms</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">1.1 Binding Agreement</h3>
              <p>
                By registering for, accessing, or using FitCoach, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference. This Agreement constitutes a legally binding contract between you and FitCoach.
              </p>

              <h3 className="client-card__subsection-title">1.2 Eligibility</h3>
              <ul className="client-list">
                <li>You must be at least 13 years old to use our Service (or 16 years old if you are in the EEA)</li>
                <li>If you are between 13-18 years old (or 16-18 in the EEA), you must have parental or guardian consent to use our Service</li>
                <li>You must have the legal capacity to enter into a binding agreement</li>
                <li>You must not be prohibited from using our Service under applicable laws</li>
                <li>You represent that all information you provide is accurate, current, and complete</li>
              </ul>

              <h3 className="client-card__subsection-title">1.3 Account Registration</h3>
              <ul className="client-list">
                <li>You must register for an account to access most features of our Service</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are solely responsible for all activities that occur under your account</li>
                <li>You must immediately notify us of any unauthorized access or security breach</li>
              </ul>

              <h3 className="client-card__subsection-title">1.4 User Roles</h3>
              <p>Our Service supports three distinct user roles:</p>
              <ul className="client-list">
                <li><strong>Clients:</strong> Individuals seeking health and fitness coaching services</li>
                <li><strong>Coaches:</strong> Certified health and fitness professionals providing coaching services</li>
                <li><strong>Administrators:</strong> Platform administrators with elevated privileges for platform management</li>
              </ul>
              <p>Your rights, responsibilities, and access to features vary based on your assigned role.</p>
            </div>
          </div>

          {/* Section 2: Description of Service */}
          <div className="client-card">
            <h2 className="client-card__section-title">2. Description of Service</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">2.1 Platform Overview</h3>
              <p>
                FitCoach is a comprehensive health and fitness coaching platform that connects certified coaches with clients seeking personalized wellness guidance. Our Service facilitates:
              </p>
              <ul className="client-list">
                <li>Client-coach matching through referral codes</li>
                <li>Personalized coaching plan creation and management</li>
                <li>Health and progress tracking (weight, height, BMI, water intake, notes)</li>
                <li>Progress photography documentation</li>
                <li>Subscription and payment management</li>
                <li>Product marketplace for health and fitness products</li>
                <li>Order processing and fulfillment</li>
                <li>In-app notifications and communication tools</li>
                <li>Dashboard analytics for coaches and clients</li>
              </ul>

              <h3 className="client-card__subsection-title">2.2 Service Availability</h3>
              <ul className="client-list">
                <li>We strive to provide continuous access to our Service, but we do not guarantee uninterrupted availability</li>
                <li>The Service may be temporarily unavailable due to maintenance, updates, or technical issues</li>
                <li>We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice</li>
                <li>We are not liable for any interruption, delay, or unavailability of the Service</li>
              </ul>

              <h3 className="client-card__subsection-title">2.3 Service Modifications</h3>
              <ul className="client-list">
                <li>We may update, change, or discontinue features of the Service at our discretion</li>
                <li>We may introduce new features that may be subject to additional terms or fees</li>
                <li>Material changes to core functionality will be communicated in advance when reasonably possible</li>
                <li>Continued use of the Service after changes constitutes acceptance of the modified Service</li>
              </ul>

              <h3 className="client-card__subsection-title">2.4 Not Medical Advice - Health and Safety Disclaimer</h3>
              <p><strong>IMPORTANT DISCLAIMER:</strong></p>
              <ul className="client-list">
                <li>FitCoach and the coaching services provided through our platform are <strong>not a substitute for professional medical advice, diagnosis, or treatment</strong></li>
                <li>Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition</li>
                <li>Never disregard professional medical advice or delay seeking it because of information obtained through our Service</li>
                <li>Coaches on our platform are fitness professionals, not licensed medical doctors (unless explicitly stated otherwise)</li>
                <li>The Service is intended for general fitness, wellness, and lifestyle guidance only</li>
                <li><strong>BY USING THIS SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE CONSULTED OR WILL CONSULT WITH A QUALIFIED HEALTHCARE PROFESSIONAL BEFORE STARTING ANY FITNESS, NUTRITION, OR WELLNESS PROGRAM</strong></li>
                <li><strong>YOU EXPRESSLY WAIVE ANY CLAIMS AGAINST FitCoach FOR ANY HEALTH OUTCOMES, INJURIES, OR ADVERSE EFFECTS RESULTING FROM FOLLOWING COACHING ADVICE OR USING THE SERVICE</strong></li>
                <li>You assume all risks associated with your use of the Service and acknowledge that physical activity carries inherent risks</li>
              </ul>
            </div>
          </div>

          {/* Section 3: User Accounts and Security */}
          <div className="client-card">
            <h2 className="client-card__section-title">3. User Accounts and Security</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">3.1 Account Creation</h3>
              <ul className="client-list">
                <li><strong>Required Information:</strong> Full name, email address, phone number, WhatsApp number, password, and role selection (client or coach)</li>
                <li><strong>Coach Referral:</strong> Clients must provide a valid coach referral code during registration to be assigned to a coach</li>
                <li><strong>Verification:</strong> We may require email verification or additional identity verification</li>
                <li><strong>One Account Per Person:</strong> You may only create one account per email address</li>
              </ul>

              <h3 className="client-card__subsection-title">3.2 Account Security</h3>
              <ul className="client-list">
                <li>You must choose a strong password (minimum 8 characters)</li>
                <li>You must not share your password or account credentials with anyone</li>
                <li>You must not allow anyone else to access your account</li>
                <li>You are responsible for all activities occurring under your account, whether or not authorized by you</li>
                <li>You must immediately notify us at mail.fitcoach@gmail.com if you suspect unauthorized access</li>
              </ul>

              <h3 className="client-card__subsection-title">3.3 Session Management</h3>
              <ul className="client-list">
                <li>Our Service uses JWT (JSON Web Tokens) for authentication with access tokens valid for 15 minutes</li>
                <li>Refresh tokens stored in secure HTTP-only cookies are valid for 7 days</li>
                <li>You can log out from individual devices or all devices simultaneously</li>
                <li>Sessions expire automatically after the token validity period</li>
              </ul>

              <h3 className="client-card__subsection-title">3.4 Account Information Updates</h3>
              <ul className="client-list">
                <li>You must keep your account information accurate and up-to-date</li>
                <li>You can update your profile information, contact details, and preferences through your account settings</li>
                <li>Changes to your email address may require reverification</li>
                <li>You cannot change your assigned coach without creating a new account (subject to our policies)</li>
              </ul>

              <h3 className="client-card__subsection-title">3.5 Account Termination by User</h3>
              <ul className="client-list">
                <li>You may close your account at any time by contacting us at mail.fitcoach@gmail.com</li>
                <li>Account closure does not automatically entitle you to refunds for active subscriptions or purchases</li>
                <li>We may retain certain information as required by law or for legitimate business purposes (see our Privacy Policy)</li>
                <li>You remain responsible for any obligations incurred before account closure</li>
              </ul>
            </div>
          </div>

          {/* Section 4: User Conduct and Prohibited Activities */}
          <div className="client-card">
            <h2 className="client-card__section-title">4. User Conduct and Prohibited Activities</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">4.1 Acceptable Use</h3>
              <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree to:</p>
              <ul className="client-list">
                <li>Provide accurate and truthful information</li>
                <li>Respect the rights and privacy of other users</li>
                <li>Use the Service in good faith for its intended purposes</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect intellectual property rights</li>
              </ul>

              <h3 className="client-card__subsection-title">4.2 Prohibited Activities</h3>
              <p>You must not:</p>
              <ul className="client-list">
                <li><strong>Illegal Activity:</strong> Use the Service for any unlawful purpose or to violate any laws</li>
                <li><strong>Fraud:</strong> Provide false information, impersonate others, or engage in fraudulent activities</li>
                <li><strong>Harassment:</strong> Harass, abuse, threaten, or harm other users, coaches, or our staff</li>
                <li><strong>Spam:</strong> Send unsolicited communications or spam through the Service</li>
                <li><strong>Account Abuse:</strong> Create multiple accounts, share accounts, or transfer accounts without authorization</li>
                <li><strong>Security Violations:</strong> Attempt to breach, circumvent, or test security measures</li>
                <li><strong>Unauthorized Access:</strong> Access other users' accounts or restricted areas of the platform</li>
                <li><strong>Malicious Code:</strong> Upload viruses, malware, or other harmful code</li>
                <li><strong>Scraping:</strong> Use automated means to access, scrape, or collect data from the Service</li>
                <li><strong>Reverse Engineering:</strong> Decompile, reverse engineer, or attempt to derive source code from the Service</li>
                <li><strong>Interference:</strong> Disrupt or interfere with the Service, servers, or networks</li>
                <li><strong>Misleading Information:</strong> Provide false health information or fake progress data</li>
                <li><strong>Payment Fraud:</strong> Upload fake payment proofs or manipulate transaction records</li>
              </ul>

              <h3 className="client-card__subsection-title">4.3 Content Standards</h3>
              <p>Any content you upload, post, or share must not:</p>
              <ul className="client-list">
                <li>Be illegal, defamatory, obscene, pornographic, or offensive</li>
                <li>Infringe intellectual property rights of others</li>
                <li>Contain personal information of others without their consent</li>
                <li>Promote violence, discrimination, or illegal activities</li>
                <li>Contain misleading or false health claims</li>
                <li>Violate privacy or confidentiality obligations</li>
              </ul>

              <h3 className="client-card__subsection-title">4.4 Rate Limiting and Abuse Prevention</h3>
              <ul className="client-list">
                <li>We implement rate limiting (100 requests per 15 minutes for general API usage)</li>
                <li>Authentication endpoints are limited to 50 attempts per 10 minutes</li>
                <li>Exceeding rate limits may result in temporary or permanent account restrictions</li>
                <li>We reserve the right to block or throttle access from abusive users or bots</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Coach-Specific Terms */}
          <div className="client-card">
            <h2 className="client-card__section-title">5. Coach-Specific Terms</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">5.1 Coach Qualifications and Verification</h3>
              <p>By registering as a coach, you represent and warrant that:</p>
              <ul className="client-list">
                <li>You possess the necessary qualifications, certifications, and expertise to provide health and fitness coaching</li>
                <li>You are legally permitted to provide coaching services in your jurisdiction</li>
                <li>All information about your credentials, experience, and qualifications is accurate and current</li>
                <li>You maintain appropriate professional liability insurance (where required by law)</li>
                <li>You comply with all applicable professional standards and regulations</li>
              </ul>
              <p><strong>IMPORTANT NOTICE:</strong></p>
              <ul className="client-list">
                <li><strong>FitCoach does NOT verify, validate, or certify coach qualifications, credentials, or certifications</strong></li>
                <li><strong>FitCoach is NOT responsible for the accuracy of coach-provided information or the quality of coaching services</strong></li>
                <li>Coaches are solely responsible for their professional conduct, qualifications, and the accuracy of their representations</li>
                <li>Clients are advised to independently verify coach credentials before engaging their services</li>
              </ul>

              <h3 className="client-card__subsection-title">5.2 Coach Responsibilities</h3>
              <ul className="client-list">
                <li><strong>Professional Conduct:</strong> Maintain professional standards and ethical behavior in all client interactions</li>
                <li><strong>Client Safety:</strong> Prioritize client safety and well-being; refer clients to medical professionals when appropriate</li>
                <li><strong>Accurate Information:</strong> Provide evidence-based guidance and avoid making false or misleading claims</li>
                <li><strong>Confidentiality:</strong> Respect client privacy and maintain confidentiality of client information</li>
                <li><strong>Service Quality:</strong> Deliver coaching services with reasonable skill and care</li>
                <li><strong>Availability:</strong> Maintain reasonable availability and responsiveness to assigned clients</li>
              </ul>

              <h3 className="client-card__subsection-title">5.3 Coach Profile and Content</h3>
              <ul className="client-list">
                <li>Your profile information (name, specialization, experience, description, social media links) is publicly visible</li>
                <li>You may upload portfolio content (awards, certifications, transformation photos) to showcase your expertise</li>
                <li>All profile content must be accurate, professional, and comply with content standards</li>
                <li>You own the intellectual property rights to content you upload</li>
                <li>You grant us a license to display your content as part of the Service</li>
              </ul>

              <h3 className="client-card__subsection-title">5.4 Coaching Plans and Programs</h3>
              <ul className="client-list">
                <li>Coaches can create template plans and client-specific plans</li>
                <li>Plans must include clear titles, descriptions, goals, duration (1-52 weeks), and pricing</li>
                <li>Plans should be realistic, safe, and appropriate for the target client population</li>
                <li>Coaches are responsible for the content and safety of their coaching plans</li>
                <li>Plans remain your intellectual property but we may store and display them as part of the Service</li>
              </ul>

              <h3 className="client-card__subsection-title">5.5 Client Management</h3>
              <ul className="client-list">
                <li>Coaches receive a unique referral code for client onboarding</li>
                <li>Coaches can view and manage their assigned clients' data (health metrics, progress, subscriptions)</li>
                <li>Coaches must use client data only for providing coaching services</li>
                <li>Coaches cannot transfer clients to other coaches without proper process</li>
                <li>Coaches must respond to plan requests and subscription approvals in a timely manner</li>
              </ul>

              <h3 className="client-card__subsection-title">5.6 Product Sales</h3>
              <ul className="client-list">
                <li>Coaches can list health and fitness products for sale through the platform</li>
                <li>Product information (name, description, MRP, price, category, images) must be accurate</li>
                <li>Coaches are responsible for product quality, authenticity, and fulfillment</li>
                <li>Coaches must comply with consumer protection laws and regulations</li>
                <li>FitCoach is not responsible for product quality, delivery, or disputes</li>
              </ul>

              <h3 className="client-card__subsection-title">5.7 Payment and QR Codes</h3>
              <ul className="client-list">
                <li>Coaches may upload UPI payment QR codes for receiving manual payments</li>
                <li>All payments are directly between coaches and clients; FitCoach does not process payments</li>
                <li>Coaches are responsible for their own tax reporting and compliance</li>
                <li>Coaches must maintain accurate financial records</li>
              </ul>

              <h3 className="client-card__subsection-title">5.8 Coach Conduct Standards</h3>
              <p>Coaches must not:</p>
              <ul className="client-list">
                <li>Make unsubstantiated health claims or guarantee specific results</li>
                <li>Provide medical diagnoses or prescribe medications</li>
                <li>Recommend extreme or dangerous practices</li>
                <li>Exploit or take advantage of vulnerable clients</li>
                <li>Engage in romantic or inappropriate relationships with clients</li>
                <li>Misrepresent qualifications or credentials</li>
                <li>Compete directly with FitCoach or solicit clients off-platform</li>
              </ul>
            </div>
          </div>

          {/* Section 6: Platform Subscription for Coaches */}
          <div className="client-card">
            <h2 className="client-card__section-title">6. Platform Subscription for Coaches</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">6.1 Platform Subscription Requirement</h3>
              <p>
                All coaches registered on FitCoach are required to maintain an active platform subscription to access coaching features and manage clients.
              </p>

              <h3 className="client-card__subsection-title">6.2 Subscription Terms</h3>
              <ul className="client-list">
                <li><strong>Free Trial:</strong> New coaches receive a 28-day free trial period upon registration</li>
                <li><strong>Monthly Fee:</strong> After the trial period, coaches must pay ₹99 per month to continue using the platform</li>
                <li><strong>Subscription Duration:</strong> Each payment provides 30 days of platform access</li>
                <li><strong>Payment Method:</strong> Payments are made via admin-provided QR code (UPI or bank transfer)</li>
                <li><strong>Payment Proof:</strong> Coaches must upload payment proof screenshot when submitting payment</li>
              </ul>

              <h3 className="client-card__subsection-title">6.3 Subscription Status</h3>
              <ul className="client-list">
                <li><strong>Trial:</strong> Free 28-day trial period for new coaches with full platform access</li>
                <li><strong>Active:</strong> Paid subscription with valid access to all coaching features</li>
                <li><strong>Expired:</strong> Subscription period ended; coach cannot access coaching features</li>
                <li><strong>Suspended:</strong> Account suspended by admin for policy violations or payment issues</li>
              </ul>

              <h3 className="client-card__subsection-title">6.4 Payment Approval Process</h3>
              <ul className="client-list">
                <li><strong>Step 1:</strong> Coach submits payment with proof and transaction details</li>
                <li><strong>Step 2:</strong> Payment enters "pending" status awaiting admin review</li>
                <li><strong>Step 3:</strong> Admin reviews payment proof and approves or rejects</li>
                <li><strong>Step 4:</strong> If approved, subscription is activated for 30 days from approval date</li>
                <li><strong>Step 5:</strong> If rejected, reason is provided and coach may resubmit</li>
                <li><strong>Timeline:</strong> Admin reviews are typically completed within 24-48 hours</li>
              </ul>

              <h3 className="client-card__subsection-title">6.5 Access Restrictions for Expired Subscriptions</h3>
              <p>When a coach's subscription expires, the following restrictions apply:</p>
              <ul className="client-list">
                <li><strong>Blocked Features:</strong> Cannot manage coaching plans, products, client orders, or subscriptions</li>
                <li><strong>Read-Only Access:</strong> Can view own profile and access platform subscription payment page</li>
                <li><strong>Notifications:</strong> Automated email reminders sent 3 days before, 1 day before, and on expiry date</li>
                <li><strong>Data Retention:</strong> All data (clients, plans, products) is retained and restored upon renewal</li>
                <li><strong>Client Impact:</strong> Assigned clients cannot place new orders or subscribe to plans while coach subscription is expired</li>
              </ul>

              <h3 className="client-card__subsection-title">6.6 Subscription Renewal</h3>
              <ul className="client-list">
                <li>Subscriptions do not auto-renew; coaches must manually pay before or after expiry</li>
                <li>Coaches can submit payment at any time, even after expiry</li>
                <li>New 30-day period starts from admin approval date</li>
                <li>Payment history is maintained for all subscription payments</li>
              </ul>

              <h3 className="client-card__subsection-title">6.7 Trial Extensions and Special Circumstances</h3>
              <ul className="client-list">
                <li>Admin may extend trial or subscription periods for legitimate reasons (technical issues, medical emergencies, platform downtime)</li>
                <li>Extension requests should be submitted to mail.fitcoach@gmail.com with justification</li>
                <li>Extensions are granted at admin's sole discretion</li>
                <li>Extensions do not create automatic refund entitlements</li>
              </ul>

              <h3 className="client-card__subsection-title">6.8 Payment History and Tracking</h3>
              <ul className="client-list">
                <li>Coaches can view complete payment history in their dashboard</li>
                <li>Each payment record includes: amount, transaction ID, date, status, approval date, validity period</li>
                <li>Total amount paid across all payments is tracked and displayed</li>
                <li>Payment records are retained for accounting and tax purposes</li>
              </ul>

              <h3 className="client-card__subsection-title">6.9 Consequences of Non-Payment</h3>
              <ul className="client-list">
                <li><strong>Immediate:</strong> Loss of access to coaching features upon expiry</li>
                <li><strong>Extended Non-Payment:</strong> After 90 days of expired status, account may be deactivated</li>
                <li><strong>No Data Loss:</strong> Data is retained even during expired periods</li>
                <li><strong>Client Communication:</strong> Coaches should inform clients of any service interruptions due to subscription lapse</li>
              </ul>

              <h3 className="client-card__subsection-title">6.10 Refund Policy</h3>
              <p>
                Platform subscription refunds are governed by our Refund Policy (see separate document). Key points:
              </p>
              <ul className="client-list">
                <li>Pending payments can be refunded before approval</li>
                <li>Approved payments may be partially refunded within 7 days based on unused days</li>
                <li>After 7 days, generally non-refundable as platform access has been provided</li>
                <li>Rejected payments receive automatic full refund</li>
              </ul>

              <h3 className="client-card__subsection-title">6.11 Future Changes to Subscription Terms</h3>
              <ul className="client-list">
                <li>We reserve the right to modify subscription pricing, duration, or terms with 30 days' advance notice</li>
                <li>Active subscriptions are honored at original terms until expiry</li>
                <li>Coaches will be notified of changes via email and platform notifications</li>
              </ul>
            </div>
          </div>

          {/* Section 7: Client-Specific Terms */}
          <div className="client-card">
            <h2 className="client-card__section-title">7. Client-Specific Terms</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">6.1 Coach Assignment and Client Responsibility</h3>
              <ul className="client-list">
                <li>Clients must register using a valid coach referral code</li>
                <li>Once assigned, your coach relationship is established and cannot be changed without creating a new account</li>
                <li>Your assigned coach will have access to your health data, progress logs, and subscription information</li>
                <li>Coach assignment is primarily for service delivery; we do not guarantee specific outcomes</li>
                <li><strong>YOU ARE SOLELY RESPONSIBLE FOR SELECTING YOUR COACH; FitCoach does not recommend or endorse any specific coach</strong></li>
                <li><strong>You are advised to independently verify your coach's qualifications, experience, and credentials before engaging their services</strong></li>
                <li><strong>FitCoach is not liable for any disputes, fraud, or issues arising from your coach-client relationship</strong></li>
              </ul>

              <h3 className="client-card__subsection-title">6.2 Health and Progress Tracking</h3>
              <ul className="client-list">
                <li>You may log health metrics including weight, height, BMI, water intake, and notes</li>
                <li>You may upload progress photos for documentation and coach review</li>
                <li>All health data you provide should be accurate to the best of your knowledge</li>
                <li>Progress tracking is a tool to assist you and your coach; it is not a medical monitoring system</li>
                <li>You should consult healthcare professionals for medical concerns, not rely solely on the Service</li>
              </ul>

              <h3 className="client-card__subsection-title">6.3 Coaching Plans</h3>
              <ul className="client-list">
                <li>Your coach may create personalized coaching plans with tasks, goals, and timelines</li>
                <li>You are responsible for following coaching guidance safely and appropriately</li>
                <li>You should communicate with your coach about any difficulties, concerns, or health changes</li>
                <li>Plans are recommendations and guidance, not medical prescriptions</li>
                <li>You have the right to decline or modify coaching recommendations</li>
              </ul>

              <h3 className="client-card__subsection-title">6.4 Client Responsibilities</h3>
              <ul className="client-list">
                <li><strong>Honesty:</strong> Provide accurate health information to your coach</li>
                <li><strong>Communication:</strong> Maintain reasonable communication with your coach</li>
                <li><strong>Safety:</strong> Stop any activity that causes pain or discomfort and consult a healthcare professional</li>
                <li><strong>Medical Consultation:</strong> Inform your coach of any medical conditions, injuries, or medications</li>
                <li><strong>Compliance:</strong> Follow coaching plans responsibly and within your capabilities</li>
                <li><strong>Payment:</strong> Pay for subscriptions and products promptly and honestly</li>
              </ul>

              <h3 className="client-card__subsection-title">6.5 Plan Requests</h3>
              <ul className="client-list">
                <li>You may request to join specific coaching plans offered by your coach</li>
                <li>Plan requests are subject to coach approval</li>
                <li>Coaches may approve, decline, or request additional information</li>
                <li>Approved plan requests may result in subscription creation</li>
              </ul>
            </div>
          </div>

          {/* Section 8: Subscriptions and Billing */}
          <div className="client-card">
            <h2 className="client-card__section-title">8. Client Subscriptions and Billing</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">7.1 Subscription Model</h3>
              <ul className="client-list">
                <li>Clients subscribe to coaching plans offered by their assigned coach</li>
                <li>Subscriptions have defined durations (typically 4 weeks, up to 52 weeks)</li>
                <li>Subscription pricing is set by coaches for their respective plans</li>
                <li>Subscriptions grant access to personalized coaching services for the subscription period</li>
              </ul>

              <h3 className="client-card__subsection-title">7.2 Subscription Process</h3>
              <ul className="client-list">
                <li><strong>Step 1:</strong> Client selects a plan and initiates subscription</li>
                <li><strong>Step 2:</strong> If paid plan, client makes payment and uploads payment proof</li>
                <li><strong>Step 3:</strong> Subscription enters "pending" status awaiting coach approval</li>
                <li><strong>Step 4:</strong> Coach reviews payment proof and approves or rejects subscription</li>
                <li><strong>Step 5:</strong> Upon approval, subscription becomes "active" with start date and end date set</li>
                <li><strong>Step 6:</strong> Subscription automatically expires at end date unless renewed</li>
              </ul>

              <h3 className="client-card__subsection-title">7.3 Payment Methods</h3>
              <ul className="client-list">
                <li>Currently, payments are processed manually using coach-provided payment methods (UPI QR codes, cash, or other agreed methods)</li>
                <li>Clients must upload valid payment proof when subscribing to paid plans</li>
                <li>FitCoach does not process payments directly; all transactions are between clients and coaches</li>
                <li>Future integration with automated payment processors may be introduced</li>
              </ul>

              <h3 className="client-card__subsection-title">7.4 Subscription Status</h3>
              <ul className="client-list">
                <li><strong>Pending:</strong> Subscription awaiting coach approval</li>
                <li><strong>Approved:</strong> Active subscription with valid start and end dates</li>
                <li><strong>Rejected:</strong> Coach declined the subscription (reason may be provided)</li>
                <li><strong>Expired:</strong> Subscription end date has passed</li>
                <li><strong>Cancelled:</strong> Client or coach cancelled the subscription before expiry</li>
              </ul>

              <h3 className="client-card__subsection-title">7.5 Subscription Cancellation</h3>
              <ul className="client-list">
                <li>Clients may cancel pending or approved subscriptions through their account</li>
                <li>Cancellation policies and refund eligibility are governed by our Refund Policy (see separate document)</li>
                <li>Cancelled subscriptions immediately lose access to plan-specific features</li>
                <li>Historical data and progress logs remain accessible after cancellation</li>
              </ul>

              <h3 className="client-card__subsection-title">7.6 Overlapping Subscriptions</h3>
              <ul className="client-list">
                <li>When a coach approves a new subscription, overlapping approved subscriptions for the same client are automatically expired</li>
                <li>Only one active subscription per client is permitted at a time</li>
                <li>Historical subscription records are maintained for reference</li>
              </ul>

              <h3 className="client-card__subsection-title">7.7 Subscription Renewals</h3>
              <ul className="client-list">
                <li>Subscriptions do not automatically renew</li>
                <li>Clients must manually subscribe again before or after expiry to continue services</li>
                <li>Coaches may send reminders about upcoming subscription expiration</li>
              </ul>

              <h3 className="client-card__subsection-title">7.8 Free and Default Plans</h3>
              <ul className="client-list">
                <li>Coaches may offer free plans (price: 0) that do not require payment</li>
                <li>Coaches may designate a default template plan for their clients</li>
                <li>Clients without active paid subscriptions may access default or template plans if available</li>
              </ul>

              <h3 className="client-card__subsection-title">7.9 Pricing Changes</h3>
              <ul className="client-list">
                <li>Coaches may change plan pricing at their discretion</li>
                <li>Pricing changes do not affect existing active subscriptions</li>
                <li>New pricing applies to future subscriptions only</li>
              </ul>
            </div>
          </div>

          {/* Section 9: Products and Orders */}
          <div className="client-card">
            <h2 className="client-card__section-title">9. Products and Orders</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">8.1 Product Marketplace</h3>
              <ul className="client-list">
                <li>Coaches may list health and fitness products for sale to their clients</li>
                <li>Product listings include name, description, MRP (maximum retail price), selling price, category, and images</li>
                <li>Product availability and pricing are managed by individual coaches</li>
                <li>FitCoach acts as a platform facilitator; we are not the seller of products</li>
              </ul>

              <h3 className="client-card__subsection-title">8.2 Order Placement</h3>
              <ul className="client-list">
                <li>Clients can place orders for products offered by their assigned coach</li>
                <li>Orders include selected products, quantities, pricing, and optional voucher codes</li>
                <li>Clients must upload payment proof when placing orders</li>
                <li>Orders enter "pending" status upon submission</li>
              </ul>

              <h3 className="client-card__subsection-title">8.3 Order Status and Fulfillment</h3>
              <ul className="client-list">
                <li><strong>Pending:</strong> Order submitted, awaiting coach review</li>
                <li><strong>Approved:</strong> Coach confirmed order and payment</li>
                <li><strong>Fulfilled:</strong> Products prepared for delivery or pickup</li>
                <li><strong>Completed:</strong> Order successfully delivered to client</li>
                <li><strong>Cancelled:</strong> Order cancelled by client or coach</li>
                <li><strong>Rejected:</strong> Coach declined the order</li>
              </ul>

              <h3 className="client-card__subsection-title">8.4 Vouchers and Discounts</h3>
              <ul className="client-list">
                <li>Coaches may create discount vouchers for their clients</li>
                <li>Vouchers have codes, discount percentages, validity periods, and may be client-specific or general</li>
                <li>Clients can apply voucher codes during order placement</li>
                <li>Voucher validation and redemption tracking is automated</li>
                <li>Expired or invalid vouchers cannot be applied</li>
              </ul>

              <h3 className="client-card__subsection-title">8.5 Product Quality and Disputes</h3>
              <ul className="client-list">
                <li>Coaches are solely responsible for product quality, authenticity, and safety</li>
                <li>Clients should verify product details, ingredients, and suitability before purchasing</li>
                <li>Product-related disputes should be resolved directly between client and coach</li>
                <li>FitCoach is not liable for product defects, injuries, or dissatisfaction</li>
                <li>Refund and return policies are subject to our Refund Policy and individual coach policies</li>
              </ul>

              <h3 className="client-card__subsection-title">8.6 Delivery and Logistics</h3>
              <ul className="client-list">
                <li>Product delivery and logistics are managed by coaches</li>
                <li>Delivery timelines, methods, and costs are determined by coaches</li>
                <li>Clients should provide accurate delivery addresses</li>
                <li>FitCoach is not responsible for delivery delays or failures</li>
              </ul>
            </div>
          </div>

          {/* Section 10: Intellectual Property Rights */}
          <div className="client-card">
            <h2 className="client-card__section-title">10. Intellectual Property Rights</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">9.1 FitCoach's Intellectual Property</h3>
              <ul className="client-list">
                <li>All content, features, functionality, software, designs, logos, trademarks, and service marks of FitCoach are owned by us or our licensors</li>
                <li>The Service and all underlying technology are protected by copyright, trademark, patent, trade secret, and other intellectual property laws</li>
                <li>You may not copy, modify, distribute, sell, or lease any part of our Service or software</li>
                <li>You may not reverse engineer, decompile, or attempt to extract source code from our Service</li>
                <li>The "FitCoach" name and logo are our trademarks and may not be used without permission</li>
              </ul>

              <h3 className="client-card__subsection-title">9.2 User Content Ownership</h3>
              <ul className="client-list">
                <li>You retain ownership of all content you create, upload, or submit to the Service (photos, text, health data, etc.)</li>
                <li>You are responsible for ensuring you have the necessary rights to all content you upload</li>
                <li>You must not upload content that infringes on others' intellectual property rights</li>
              </ul>

              <h3 className="client-card__subsection-title">9.3 License to FitCoach</h3>
              <p>By uploading content to the Service, you grant FitCoach a worldwide, non-exclusive, royalty-free, transferable license to:</p>
              <ul className="client-list">
                <li>Store, display, reproduce, and distribute your content as necessary to provide the Service</li>
                <li>Use your content for platform functionality (e.g., showing profile photos, progress photos to your coach)</li>
                <li>Create backup copies for data protection</li>
                <li>Use anonymized or aggregated data for analytics and improvements</li>
              </ul>
              <p>This license ends when you delete your content or close your account, except for content that has been shared with others or is required to be retained by law.</p>

              <h3 className="client-card__subsection-title">9.4 Coach Portfolio Content</h3>
              <ul className="client-list">
                <li>Coaches retain ownership of portfolio content (awards, certifications, transformation photos)</li>
                <li>Coaches grant us permission to publicly display their portfolio content as part of their coach profile</li>
                <li>Coaches represent that they have necessary rights and permissions for all portfolio content, including client consent for transformation photos</li>
              </ul>

              <h3 className="client-card__subsection-title">9.5 Copyright Infringement</h3>
              <ul className="client-list">
                <li>We respect intellectual property rights and expect users to do the same</li>
                <li>If you believe content on our Service infringes your copyright, please contact us at mail.fitcoach@gmail.com with:
                  <ul className="client-list">
                    <li>Description of the copyrighted work</li>
                    <li>Location of the infringing material on our Service</li>
                    <li>Your contact information</li>
                    <li>Statement of good faith belief that use is not authorized</li>
                    <li>Statement that information is accurate and you are authorized to act</li>
                  </ul>
                </li>
                <li>We will investigate and take appropriate action, including content removal if warranted</li>
              </ul>

              <h3 className="client-card__subsection-title">9.6 Third-Party Content</h3>
              <ul className="client-list">
                <li>The Service may display or link to third-party content (social media, websites, etc.)</li>
                <li>Third-party content is the property of its respective owners</li>
                <li>We do not endorse or assume responsibility for third-party content</li>
              </ul>
            </div>
          </div>

          {/* Section 11: Privacy and Data Protection */}
          <div className="client-card">
            <h2 className="client-card__section-title">11. Privacy and Data Protection</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">10.1 Privacy Policy</h3>
              <p>
                Your privacy is important to us. Our collection, use, storage, and sharing of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to our Privacy Policy.
              </p>

              <h3 className="client-card__subsection-title">10.2 Data You Provide</h3>
              <ul className="client-list">
                <li>You are responsible for the accuracy and legality of data you provide</li>
                <li>You must not provide false, misleading, or fraudulent information</li>
                <li>You must not upload others' personal information without their consent</li>
              </ul>

              <h3 className="client-card__subsection-title">10.3 Data Sharing Within Platform</h3>
              <ul className="client-list">
                <li>Your assigned coach has access to your health data, progress logs, and subscription information</li>
                <li>Coach profile information is publicly visible to help clients find coaches</li>
                <li>Administrators may access user data for platform management and support</li>
              </ul>

              <h3 className="client-card__subsection-title">10.4 Data Security</h3>
              <ul className="client-list">
                <li>We implement industry-standard security measures to protect your data</li>
                <li>However, no system is completely secure, and we cannot guarantee absolute security</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
              </ul>

              <h3 className="client-card__subsection-title">10.5 Your Rights</h3>
              <p>You have rights regarding your personal data, including rights to access, correct, delete, and port your data. See our Privacy Policy for complete details on exercising your rights.</p>
            </div>
          </div>

          {/* Section 12: Disclaimers and Limitations of Liability */}
          <div className="client-card">
            <h2 className="client-card__section-title">12. Disclaimers and Limitations of Liability</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">11.1 Service "As Is"</h3>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
              <ul className="client-list">
                <li>We do not warrant that the Service will be uninterrupted, secure, or error-free</li>
                <li>We do not warrant that results obtained from the Service will be accurate or reliable</li>
                <li>We do not warrant that defects will be corrected</li>
                <li>Any material downloaded or obtained through the Service is done at your own risk</li>
              </ul>

              <h3 className="client-card__subsection-title">11.2 Medical Disclaimer and Platform Liability Limitation</h3>
              <p><strong>IMPORTANT:</strong></p>
              <ul className="client-list">
                <li>THE SERVICE IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT</li>
                <li>FitCoach IS NOT RESPONSIBLE FOR THE QUALITY, SAFETY, OR EFFECTIVENESS OF COACHING SERVICES PROVIDED BY COACHES</li>
                <li>COACHES ARE INDEPENDENT PROFESSIONALS; WE DO NOT SUPERVISE, DIRECT, OR CONTROL THEIR SERVICES</li>
                <li>YOU ASSUME ALL RISKS ASSOCIATED WITH FOLLOWING COACHING ADVICE OR USING THE SERVICE</li>
                <li>ALWAYS CONSULT A QUALIFIED HEALTHCARE PROVIDER BEFORE STARTING ANY FITNESS OR NUTRITION PROGRAM</li>
                <li><strong>FitCoach IS ONLY A TECHNOLOGY PLATFORM PROVIDER AND IS NOT LIABLE FOR ANY FRAUD, MISCONDUCT, DISPUTES, OR ISSUES ARISING BETWEEN COACHES AND CLIENTS</strong></li>
                <li><strong>CLIENTS INDEPENDENTLY CHOOSE THEIR COACHES; FitCoach DOES NOT RECOMMEND, ENDORSE, OR GUARANTEE ANY COACH</strong></li>
                <li><strong>FitCoach's LIABILITY IS LIMITED TO PLATFORM-RELATED TECHNICAL ISSUES ONLY AND DOES NOT EXTEND TO COACHING SERVICES, PRODUCTS, OR COACH-CLIENT RELATIONSHIPS</strong></li>
                <li><strong>FitCoach DOES NOT SELL, RENT, OR TRADE USER DATA TO THIRD PARTIES FOR COMMERCIAL PURPOSES</strong></li>
              </ul>

              <h3 className="client-card__subsection-title">11.3 No Guarantee of Results</h3>
              <ul className="client-list">
                <li>We do not guarantee any specific health, fitness, or wellness outcomes</li>
                <li>Results vary based on individual factors, effort, compliance, and circumstances</li>
                <li>Testimonials and success stories are not guarantees of your results</li>
                <li>Past performance is not indicative of future results</li>
              </ul>

              <h3 className="client-card__subsection-title">11.4 Third-Party Content and Services</h3>
              <ul className="client-list">
                <li>We are not responsible for third-party websites, services, or content linked from our Service</li>
                <li>We do not endorse or warrant third-party products, services, or information</li>
                <li>Your interactions with third parties are solely between you and the third party</li>
              </ul>

              <h3 className="client-card__subsection-title">11.5 Limitation of Liability</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FitCoach, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR:
              </p>
              <ul className="client-list">
                <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                <li>ANY LOSS OF PROFITS, REVENUE, DATA, OR USE</li>
                <li>ANY BUSINESS INTERRUPTION OR LOSS OF GOODWILL</li>
                <li>ANY PERSONAL INJURY OR PROPERTY DAMAGE RESULTING FROM YOUR USE OF THE SERVICE</li>
                <li>ANY UNAUTHORIZED ACCESS TO OR USE OF YOUR DATA</li>
                <li>ANY ERRORS, MISTAKES, OR INACCURACIES OF CONTENT</li>
                <li>ANY CONDUCT OF COACHES OR OTHER USERS</li>
              </ul>
              <p>
                WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY, OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>

              <h3 className="client-card__subsection-title">11.6 Cap on Liability</h3>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE AMOUNT PAID BY YOU TO FitCoach, IF ANY, IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
              </p>

              <h3 className="client-card__subsection-title">11.7 Jurisdictional Limitations</h3>
              <p>
                Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities. In such jurisdictions, our liability will be limited to the maximum extent permitted by law.
              </p>
            </div>
          </div>

          {/* Section 13: Indemnification */}
          <div className="client-card">
            <h2 className="client-card__section-title">13. Indemnification</h2>
            <div className="client-card__content">
              <p>
                You agree to defend, indemnify, and hold harmless FitCoach, its officers, directors, employees, agents, affiliates, and partners from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="client-list">
                <li>Your use of and access to the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights, including intellectual property or privacy rights</li>
                <li>Your content or any content you post, upload, or share</li>
                <li>Any false or misleading information you provide</li>
                <li>Your interactions with other users or coaches</li>
                <li>Any harm, injury, or damage caused by following coaching advice</li>
                <li>For coaches: any coaching services you provide or products you sell</li>
                <li><strong>For coaches: any fraud, misrepresentation, professional negligence, or breach of duty toward clients</strong></li>
                <li><strong>Any disputes, claims, or legal actions arising from coach-client relationships, including but not limited to payment disputes, service quality disputes, or personal injury claims</strong></li>
                <li><strong>Any misrepresentation of qualifications, credentials, or expertise by coaches</strong></li>
              </ul>
              <p>
                We reserve the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will fully cooperate with us in asserting any available defenses.
              </p>
            </div>
          </div>

          {/* Section 14: Termination and Suspension */}
          <div className="client-card">
            <h2 className="client-card__section-title">14. Termination and Suspension</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">13.1 Termination by You</h3>
              <ul className="client-list">
                <li>You may terminate your account at any time by contacting us at mail.fitcoach@gmail.com</li>
                <li>You remain responsible for all obligations incurred before termination</li>
                <li>Termination does not automatically entitle you to refunds</li>
              </ul>

              <h3 className="client-card__subsection-title">13.2 Termination by Us</h3>
              <p>We may suspend or terminate your account immediately, without prior notice or liability, for any reason, including but not limited to:</p>
              <ul className="client-list">
                <li>Violation of these Terms</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Providing false information</li>
                <li>Non-payment or payment disputes</li>
                <li>Requests from law enforcement or government agencies</li>
                <li>Discontinuation of the Service</li>
                <li>Technical or security reasons</li>
                <li>Extended inactivity (after reasonable notice)</li>
              </ul>

              <h3 className="client-card__subsection-title">13.3 Effect of Termination</h3>
              <ul className="client-list">
                <li>Upon termination, your right to use the Service immediately ceases</li>
                <li>All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability</li>
                <li>We may delete your content and data after termination (subject to legal retention requirements)</li>
                <li>Active subscriptions and orders may be cancelled without refund</li>
              </ul>

              <h3 className="client-card__subsection-title">13.4 Account Deactivation</h3>
              <ul className="client-list">
                <li>We may deactivate accounts that violate our policies, setting the `isActive` flag to false</li>
                <li>Deactivated users cannot log in or access the Service</li>
                <li>Deactivation may be temporary or permanent depending on the violation</li>
              </ul>
            </div>
          </div>

          {/* Section 15: Dispute Resolution */}
          <div className="client-card">
            <h2 className="client-card__section-title">15. Dispute Resolution and Governing Law</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">14.1 Informal Resolution</h3>
              <p>
                If you have any dispute with us, you agree to first contact us at mail.fitcoach@gmail.com and attempt to resolve the dispute informally. Most disputes can be resolved through good faith communication.
              </p>

              <h3 className="client-card__subsection-title">14.2 Governing Law</h3>
              <ul className="client-list">
                <li>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions</li>
                <li>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights</li>
                <li>This agreement is subject to the Consumer Protection Act, 2019 and other applicable Indian laws</li>
              </ul>

              <h3 className="client-card__subsection-title">14.3 Jurisdiction</h3>
              <ul className="client-list">
                <li>You agree to submit to the personal jurisdiction of the courts located in India for the purpose of litigating all such claims or disputes</li>
                <li>Some jurisdictions do not allow certain limitations on warranties or liability, so some of the above limitations may not apply to you</li>
              </ul>

              <h3 className="client-card__subsection-title">14.4 Individual Disputes</h3>
              <p>
                To the extent permitted by Indian law, you agree to resolve disputes individually. This clause does not affect your statutory rights under Indian consumer protection laws, including your right to file complaints with consumer forums.
              </p>

              <h3 className="client-card__subsection-title">14.5 Time Limitation</h3>
              <p>
                You agree that any claim or cause of action arising out of or related to these Terms or the Service must be filed within one (1) year after the claim or cause of action arose, or it will be forever barred.
              </p>
            </div>
          </div>

          {/* Section 16: Changes to Terms */}
          <div className="client-card">
            <h2 className="client-card__section-title">16. Changes to These Terms</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">15.1 Right to Modify</h3>
              <p>
                We reserve the right to modify, update, or change these Terms at any time at our sole discretion. When we make changes, we will:
              </p>
              <ul className="client-list">
                <li>Update the "Last Updated" date at the top of this page</li>
                <li>Post the revised Terms on this page</li>
                <li>For material changes, provide notice via email or prominent notice on the Service</li>
              </ul>

              <h3 className="client-card__subsection-title">15.2 Your Acceptance</h3>
              <ul className="client-list">
                <li>Continued use of the Service after changes take effect constitutes acceptance of the revised Terms</li>
                <li>If you do not agree with the changes, you must stop using the Service and may close your account</li>
                <li>Material changes will be effective 30 days after notice is provided, except changes required for legal compliance may take effect immediately</li>
              </ul>

              <h3 className="client-card__subsection-title">15.3 Version History</h3>
              <p>
                We maintain version history of our Terms. You may request previous versions by contacting us at mail.fitcoach@gmail.com.
              </p>
            </div>
          </div>

          {/* Section 17: General Provisions */}
          <div className="client-card">
            <h2 className="client-card__section-title">17. General Provisions</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">16.1 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy and any other legal notices published by us on the Service, constitute the entire agreement between you and FitCoach regarding your use of the Service.
              </p>

              <h3 className="client-card__subsection-title">16.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity and enforceability of the remaining provisions.
              </p>

              <h3 className="client-card__subsection-title">16.3 Waiver</h3>
              <p>
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. Any waiver of any provision of these Terms will be effective only if in writing and signed by us.
              </p>

              <h3 className="client-card__subsection-title">16.4 Assignment</h3>
              <ul className="client-list">
                <li>You may not assign or transfer these Terms, by operation of law or otherwise, without our prior written consent</li>
                <li>We may freely assign these Terms without restriction</li>
                <li>Any attempted transfer or assignment in violation of this section will be null and void</li>
              </ul>

              <h3 className="client-card__subsection-title">16.5 Force Majeure</h3>
              <p>
                We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including acts of God, natural disasters, war, terrorism, pandemics, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
              </p>

              <h3 className="client-card__subsection-title">16.6 Relationship of Parties</h3>
              <ul className="client-list">
                <li>No agency, partnership, joint venture, or employment relationship is created between you and FitCoach</li>
                <li>Coaches are independent contractors, not employees or agents of FitCoach</li>
                <li>You have no authority to bind FitCoach in any manner</li>
              </ul>

              <h3 className="client-card__subsection-title">16.7 Headings</h3>
              <p>
                The section headings in these Terms are for convenience only and have no legal or contractual effect.
              </p>

              <h3 className="client-card__subsection-title">16.8 Language</h3>
              <p>
                These Terms are written in English. Any translations are provided for convenience only. In case of conflict, the English version prevails.
              </p>

              <h3 className="client-card__subsection-title">16.9 Electronic Communications</h3>
              <p>
                By using the Service, you consent to receiving electronic communications from us. These communications may include notices about your account, transactional information, and other information concerning the Service. You agree that all agreements, notices, disclosures, and other communications that we provide electronically satisfy any legal requirement that such communications be in writing.
              </p>
            </div>
          </div>

          {/* Section 17: India-Specific Compliance */}
          <div className="client-card">
            <h2 className="client-card__section-title">17. India-Specific Compliance and Legal Framework</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">17.1 Applicable Indian Laws</h3>
              <ul className="client-list">
                <li>This platform complies with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
                <li>We adhere to the Consumer Protection Act, 2019 and related consumer protection regulations</li>
                <li>Data retention for financial records follows Indian tax laws requiring 7 years of record-keeping</li>
              </ul>

              <h3 className="client-card__subsection-title">17.2 Data Storage and Localization</h3>
              <ul className="client-list">
                <li>FitCoach stores data with Indian and international cloud service providers (MongoDB, Cloudinary)</li>
                <li>Data may be stored and processed outside India as permitted by applicable law</li>
                <li>We implement reasonable security practices as required under Indian data protection regulations</li>
              </ul>

              <h3 className="client-card__subsection-title">17.3 GST and Tax Compliance</h3>
              <ul className="client-list">
                <li>GST registration and compliance for coaching services and product sales is the sole responsibility of individual coaches</li>
                <li>Coaches earning above the GST threshold must register and comply with GST regulations independently</li>
                <li>FitCoach platform subscription fees (₹99/month) are subject to applicable GST</li>
                <li>Coaches are responsible for issuing GST-compliant invoices to their clients where required</li>
              </ul>

              <h3 className="client-card__subsection-title">17.4 Sensitive Personal Data</h3>
              <ul className="client-list">
                <li>Given the nature of health coaching services, we collect sensitive personal data as defined under Indian law (health information, biometric data)</li>
                <li>We implement reasonable security practices and procedures to protect sensitive personal data</li>
                <li>Sensitive personal data is collected only with your consent and for legitimate service delivery purposes</li>
              </ul>
            </div>
          </div>

          {/* Section 18: Contact Information */}
          <div className="client-card">
            <h2 className="client-card__section-title">18. Contact Information</h2>
            <div className="client-card__content">
              <p>
                If you have any questions, concerns, or feedback about these Terms or the Service, please contact us:
              </p>
              <ul className="client-list">
                <li><strong>Email:</strong> mail.fitcoach@gmail.com</li>
                <li><strong>Subject Line:</strong> "Terms and Conditions Inquiry"</li>
                <li><strong>Response Time:</strong> We will respond to all inquiries within 5-7 business days</li>
              </ul>

              <h3 className="client-card__subsection-title">Legal Notices</h3>
              <ul className="client-list">
                <li><strong>For legal notices and formal communications:</strong> mail.fitcoach@gmail.com</li>
                <li><strong>For copyright infringement claims:</strong> mail.fitcoach@gmail.com with subject "Copyright Claim"</li>
                <li><strong>For data protection inquiries:</strong> mail.fitcoach@gmail.com with subject "Data Protection"</li>
              </ul>
            </div>
          </div>

          {/* Effective Date */}
          <div className="client-card client-card--date">
            <h2 className="client-card__section-title">Effective Date and Acknowledgment</h2>
            <p><strong>Effective Date:</strong> November 22, 2025</p>
            <p><strong>Version:</strong> 2.1</p>
            <p><strong>Previous Version Date:</strong> November 20, 2025</p>
            <p className="mt-4">
              By using FitCoach, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.
            </p>
          </div>

          {/* Footer acknowledgment */}
          <div className="client-card">
            <div className="client-card__content">
              <p className="text-center">
                <strong>Thank you for using FitCoach!</strong>
              </p>
              <p className="text-center">
                We are committed to providing a safe, secure, and effective platform for your health and wellness journey.
              </p>
            </div>
          </div>
        </section>
    </main>
  );
}
