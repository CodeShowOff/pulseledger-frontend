import React from "react";
import Link from "next/link";

export default function HelpCenterPage() {
  return (
    <main className="client-page footer-page">
      <header className="client-page__header">
        <h1 className="client-page__title">Help Center</h1>
        </header>

        <section className="client-page__sections">
          {/* Section 1: Getting Started */}
          <div className="client-card">
            <h2 className="client-card__section-title">1. Getting Started</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">1.1 Creating Your Account</h3>
              <p>
                PulseLedger offers two types of user accounts to suit your needs:
              </p>
              <ul className="client-list">
                <li><strong>Client Account:</strong> For individuals seeking personalized health and fitness coaching</li>
                <li><strong>Coach Account:</strong> For certified health and fitness professionals offering coaching services</li>
              </ul>
              <p><strong>Registration Steps:</strong></p>
              <ol className="client-list">
                <li>Visit the PulseLedger homepage and click the "Register" or "Sign Up" button</li>
                <li>Choose your account type (Client or Coach)</li>
                <li>Enter your full name, email address, and create a secure password</li>
                <li>Provide additional information:
                  <ul className="client-list">
                    <li><strong>For Clients:</strong> Age, gender, basic health information (height, weight, BMI)</li>
                    <li><strong>For Coaches:</strong> Specialization, years of experience, certifications, professional description</li>
                  </ul>
                </li>
                <li>Review and accept our Terms & Conditions and Privacy Policy</li>
                <li>Submit your registration</li>
                <li>Check your email for a verification code (6-digit OTP)</li>
                <li>Enter the OTP code within 10 minutes to verify your account</li>
                <li>Complete your profile setup with additional details</li>
              </ol>

              <h3 className="client-card__subsection-title">1.2 Account Verification</h3>
              <p>
                For security purposes, all new accounts must verify their email address. You'll receive a 6-digit verification code that's valid for 10 minutes. If your code expires, you can request a new one from the verification page.
              </p>
              <p><strong>Email Verification Issues:</strong></p>
              <ul className="client-list">
                <li>Check your spam/junk folder if you don't receive the verification email</li>
                <li>Ensure you entered the correct email address during registration</li>
                <li>Wait a few minutes - email delivery can sometimes be delayed</li>
                <li>Request a new verification code if the original expires</li>
                <li>Contact support at mail.pulseledger@gmail.com if problems persist</li>
              </ul>

              <h3 className="client-card__subsection-title">1.3 Profile Setup</h3>
              <p>
                After verification, complete your profile to get the best experience:
              </p>
              <p><strong>Client Profile:</strong></p>
              <ul className="client-list">
                <li>Upload a profile photo (optional but recommended)</li>
                <li>Add contact information (phone, WhatsApp number)</li>
                <li>Enter your complete address for location-based coach recommendations</li>
                <li>Update health metrics (current weight, height, target weight, BMI)</li>
                <li>Set your fitness goals and preferences</li>
              </ul>
              <p><strong>Coach Profile:</strong></p>
              <ul className="client-list">
                <li>Upload a professional profile photo</li>
                <li>Add certifications and qualifications</li>
                <li>Write a compelling professional description</li>
                <li>List your specializations and expertise areas</li>
                <li>Add before/after transformation photos to your portfolio</li>
                <li>Link your social media accounts (Instagram, Facebook, YouTube, etc.)</li>
                <li>Set your coaching fee structure</li>
                <li>Generate your unique referral code for client sign-ups</li>
              </ul>
            </div>
          </div>

          {/* Section 2: For Clients */}
          <div className="client-card">
            <h2 className="client-card__section-title">2. Guide for Clients</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">2.1 Finding and Choosing a Coach</h3>
              <p>
                PulseLedger makes it easy to find the perfect coach for your fitness journey:
              </p>
              <ol className="client-list">
                <li><strong>Browse Coaches:</strong> Visit the "Find Coaches" or "Coaches" section</li>
                <li><strong>Filter by Specialization:</strong> Use filters to find coaches who specialize in your goals (weight loss, muscle gain, nutrition, yoga, etc.)</li>
                <li><strong>View Coach Profiles:</strong> Review each coach's experience, certifications, client transformations, and ratings</li>
                <li><strong>Check Availability:</strong> See which coaches are accepting new clients</li>
                <li><strong>Use Referral Codes:</strong> If you have a coach's referral code, enter it during sign-up to be directly connected</li>
                <li><strong>Contact Request:</strong> Send a contact request with your goals and health information</li>
                <li><strong>Wait for Response:</strong> Coaches will review your request and reach out to discuss your needs</li>
              </ol>

              <h3 className="client-card__subsection-title">2.2 Subscriptions and Plans</h3>
              <p>
                Once connected with a coach, you'll subscribe to a coaching plan:
              </p>
              <p><strong>Subscription Process:</strong></p>
              <ol className="client-list">
                <li><strong>Plan Selection:</strong> Your coach will create a customized plan (1-52 weeks duration)</li>
                <li><strong>Review Plan Details:</strong> Check the plan title, duration, pricing, and included features</li>
                <li><strong>Request Subscription:</strong> Submit a plan request to your coach</li>
                <li><strong>Coach Approval:</strong> Your coach reviews and approves the request</li>
                <li><strong>Payment:</strong> Complete payment using your coach's provided method (UPI QR code, cash, etc.)</li>
                <li><strong>Admin Approval:</strong> PulseLedger admins verify the subscription</li>
                <li><strong>Subscription Activation:</strong> Your plan becomes active with full access</li>
              </ol>

              <p><strong>Subscription Status:</strong></p>
              <ul className="client-list">
                <li><strong>Pending:</strong> Awaiting coach or admin approval</li>
                <li><strong>Approved:</strong> Active subscription with full coaching access</li>
                <li><strong>Expired:</strong> Subscription period has ended (can be renewed)</li>
              </ul>

              <p><strong>Managing Subscriptions:</strong></p>
              <ul className="client-list">
                <li>View all your subscriptions in your client dashboard</li>
                <li>Track remaining days in your active subscription</li>
                <li>Renew expired subscriptions with the same or different plans</li>
                <li>Cancel subscriptions by contacting your coach</li>
                <li>Request refunds according to our Refund Policy</li>
              </ul>

              <h3 className="client-card__subsection-title">2.3 Progress Tracking</h3>
              <p>
                PulseLedger provides comprehensive tools to monitor your fitness journey:
              </p>
              <p><strong>Health Metrics Tracking:</strong></p>
              <ul className="client-list">
                <li><strong>Weight:</strong> Log your weight regularly to track changes over time</li>
                <li><strong>Height:</strong> Update height if needed (especially for growing teens)</li>
                <li><strong>BMI:</strong> Automatically calculated from height and weight</li>
                <li><strong>Water Intake:</strong> Track daily water consumption (glasses/liters)</li>
                <li><strong>Historical Data:</strong> View trends with charts showing progress over weeks/months</li>
              </ul>

              <p><strong>Progress Photos:</strong></p>
              <ul className="client-list">
                <li>Upload progress photos to visually track your transformation</li>
                <li>Add notes to each photo (date, weight at time, how you're feeling)</li>
                <li>Compare before/after photos side-by-side</li>
                <li>Share selected photos with your coach for better guidance</li>
                <li>Keep photos private or visible only to your coach</li>
              </ul>

              <p><strong>Viewing Your Progress:</strong></p>
              <ol className="client-list">
                <li>Navigate to your Client Dashboard</li>
                <li>Click on "Progress" or "Track Progress"</li>
                <li>View interactive charts showing weight, BMI, and water intake trends</li>
                <li>Access your progress photo gallery</li>
                <li>Generate progress reports to share with your coach</li>
              </ol>

              <h3 className="client-card__subsection-title">2.4 Product Marketplace</h3>
              <p>
                Many coaches offer fitness products and supplements:
              </p>
              <ul className="client-list">
                <li><strong>Browse Products:</strong> View products offered by your coach or other coaches</li>
                <li><strong>Product Details:</strong> See descriptions, prices, images, and stock availability</li>
                <li><strong>Add to Cart:</strong> Select products you want to purchase</li>
                <li><strong>Apply Vouchers:</strong> Use discount vouchers if you have any</li>
                <li><strong>Place Order:</strong> Submit your order with delivery details</li>
                <li><strong>Payment:</strong> Pay using your coach's payment method</li>
                <li><strong>Order Tracking:</strong> Monitor order status (pending, processing, shipped, delivered, cancelled)</li>
              </ul>

              <h3 className="client-card__subsection-title">2.5 Communication with Your Coach</h3>
              <ul className="client-list">
                <li>Receive in-app notifications for important updates</li>
                <li>Contact your coach via provided WhatsApp number or phone</li>
                <li>Submit plan requests for custom coaching programs</li>
                <li>Ask questions and get guidance throughout your journey</li>
                <li>Discuss progress and adjust plans as needed</li>
              </ul>
            </div>
          </div>

          {/* Section 3: For Coaches */}
          <div className="client-card">
            <h2 className="client-card__section-title">3. Guide for Coaches</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">3.1 Setting Up Your Coaching Profile</h3>
              <p>
                A strong profile attracts more clients:
              </p>
              <ul className="client-list">
                <li><strong>Professional Photo:</strong> Upload a clear, professional headshot</li>
                <li><strong>Bio & Description:</strong> Write a compelling description of your coaching philosophy and approach</li>
                <li><strong>Specializations:</strong> List your areas of expertise (weight loss, bodybuilding, yoga, nutrition counseling, etc.)</li>
                <li><strong>Experience:</strong> Enter years of coaching experience</li>
                <li><strong>Certifications:</strong> Add your professional certifications and credentials</li>
                <li><strong>Awards:</strong> Showcase any awards or recognitions you've received</li>
                <li><strong>Transformation Portfolio:</strong> Upload before/after photos of client transformations (with permission)</li>
                <li><strong>Social Media:</strong> Link your Instagram, Facebook, YouTube, and website</li>
                <li><strong>Referral Code:</strong> Generate and share your unique code for direct client sign-ups</li>
              </ul>

              <h3 className="client-card__subsection-title">3.2 Managing Contact Requests</h3>
              <p>
                When potential clients show interest:
              </p>
              <ol className="client-list">
                <li><strong>Receive Requests:</strong> Get notified when clients submit contact requests</li>
                <li><strong>Review Information:</strong> View client's name, email, phone, age, gender, height, weight, and their message</li>
                <li><strong>Request Status:</strong> Track requests as pending, contacted, converted, or rejected</li>
                <li><strong>Add Notes:</strong> Add internal notes about each request for your records</li>
                <li><strong>Contact Client:</strong> Reach out via email, phone, or WhatsApp to discuss their goals</li>
                <li><strong>Update Status:</strong> Mark requests as "contacted" once you've reached out</li>
                <li><strong>Convert to Client:</strong> When they become your client, update status to "converted"</li>
              </ol>

              <h3 className="client-card__subsection-title">3.3 Creating Coaching Plans</h3>
              <p>
                Design customized plans for your clients:
              </p>
              <p><strong>Plan Creation Steps:</strong></p>
              <ol className="client-list">
                <li>Navigate to your Coach Dashboard</li>
                <li>Click "Create New Plan" or "Add Plan"</li>
                <li>Enter plan details:
                  <ul className="client-list">
                    <li><strong>Title:</strong> Clear, descriptive name (e.g., "8-Week Weight Loss Program")</li>
                    <li><strong>Description:</strong> Detailed explanation of what the plan includes</li>
                    <li><strong>Duration:</strong> Select duration (1-52 weeks)</li>
                    <li><strong>Price:</strong> Set your coaching fee for the plan period</li>
                    <li><strong>Features:</strong> List specific features (meal plans, workout routines, weekly check-ins, etc.)</li>
                  </ul>
                </li>
                <li>Save the plan to make it available for clients</li>
                <li>Edit or delete plans as needed</li>
              </ol>

              <p><strong>Best Practices:</strong></p>
              <ul className="client-list">
                <li>Offer plans of varying durations (4 weeks, 12 weeks, 24 weeks, etc.)</li>
                <li>Price competitively based on your experience and market rates</li>
                <li>Clearly list what's included and what's not</li>
                <li>Create beginner, intermediate, and advanced level plans</li>
                <li>Update plans regularly based on client feedback</li>
              </ul>

              <h3 className="client-card__subsection-title">3.4 Managing Client Subscriptions</h3>
              <p>
                Handle your clients' active subscriptions:
              </p>
              <ul className="client-list">
                <li><strong>View All Clients:</strong> See a list of all clients assigned to you</li>
                <li><strong>Subscription Requests:</strong> Review and approve subscription requests from clients</li>
                <li><strong>Track Status:</strong> Monitor which clients have pending, active, or expired subscriptions</li>
                <li><strong>Client Progress:</strong> View your clients' progress tracking data and photos</li>
                <li><strong>Plan Adjustments:</strong> Create modified plans based on client progress</li>
                <li><strong>Renewals:</strong> Encourage clients to renew expiring subscriptions</li>
              </ul>

              <h3 className="client-card__subsection-title">3.5 Product Sales</h3>
              <p>
                Coaches can sell fitness products and supplements:
              </p>
              <p><strong>Adding Products:</strong></p>
              <ol className="client-list">
                <li>Go to "Products" in your coach dashboard</li>
                <li>Click "Add New Product"</li>
                <li>Enter product details:
                  <ul className="client-list">
                    <li>Product name and description</li>
                    <li>Price and discount (if any)</li>
                    <li>Stock quantity</li>
                    <li>Product category</li>
                    <li>Upload product images</li>
                  </ul>
                </li>
                <li>Save and publish the product</li>
              </ol>

              <p><strong>Managing Orders:</strong></p>
              <ul className="client-list">
                <li>View all orders placed with you</li>
                <li>Update order status (pending → processing → shipped → delivered)</li>
                <li>Handle cancellations and refunds</li>
                <li>Track inventory and restock as needed</li>
              </ul>

              <p><strong>Creating Vouchers:</strong></p>
              <ul className="client-list">
                <li>Generate discount codes for special promotions</li>
                <li>Set percentage or fixed amount discounts</li>
                <li>Define usage limits and expiration dates</li>
                <li>Share voucher codes with loyal clients</li>
              </ul>

              <h3 className="client-card__subsection-title">3.6 Payment Collection</h3>
              <p>
                PulseLedger is a platform facilitator - you collect payments directly:
              </p>
              <ul className="client-list">
                <li><strong>Payment Methods:</strong> You can accept payments via UPI, bank transfer, cash, or any method you prefer</li>
                <li><strong>QR Code:</strong> Upload your UPI QR code for easy client payments</li>
                <li><strong>Payment Confirmation:</strong> Mark subscriptions as paid once you receive payment</li>
                <li><strong>Receipts:</strong> Provide payment receipts directly to your clients</li>
                <li><strong>Refunds:</strong> Handle refund requests according to your policies and our Refund Policy guidelines</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Account Management */}
          <div className="client-card">
            <h2 className="client-card__section-title">4. Account Management</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">4.1 Login and Authentication</h3>
              <p><strong>Logging In:</strong></p>
              <ol className="client-list">
                <li>Visit the PulseLedger homepage</li>
                <li>Click "Login" or "Sign In"</li>
                <li>Enter your registered email and password</li>
                <li>Click "Login" to access your account</li>
              </ol>

              <p><strong>Security Features:</strong></p>
              <ul className="client-list">
                <li>Passwords are encrypted using bcrypt with 10-16 salt rounds</li>
                <li>JWT authentication with 15-minute access tokens</li>
                <li>7-day refresh tokens stored in secure HTTP-only cookies</li>
                <li>Rate limiting: 50 requests per 10 minutes on auth endpoints</li>
                <li>Account locks after multiple failed login attempts</li>
              </ul>

              <h3 className="client-card__subsection-title">4.2 Password Reset</h3>
              <p>
                If you forget your password:
              </p>
              <ol className="client-list">
                <li>Click "Forgot Password?" on the login page</li>
                <li>Enter your registered email address</li>
                <li>Check your email for a password reset OTP (6-digit code)</li>
                <li>Enter the OTP code (valid for 10 minutes)</li>
                <li>Create a new strong password</li>
                <li>Confirm your new password</li>
                <li>Log in with your new credentials</li>
              </ol>

              <p><strong>Password Requirements:</strong></p>
              <ul className="client-list">
                <li>Minimum 8 characters long</li>
                <li>Should include uppercase and lowercase letters</li>
                <li>Include at least one number</li>
                <li>Consider adding special characters for extra security</li>
              </ul>

              <h3 className="client-card__subsection-title">4.3 Profile Updates</h3>
              <p>
                Keep your information current:
              </p>
              <ul className="client-list">
                <li><strong>Personal Information:</strong> Update name, email, phone, address</li>
                <li><strong>Profile Photo:</strong> Upload or change your avatar</li>
                <li><strong>Health Data (Clients):</strong> Update weight, height, BMI, goals</li>
                <li><strong>Professional Info (Coaches):</strong> Edit bio, certifications, specializations</li>
                <li><strong>Contact Details:</strong> Change phone number, WhatsApp number</li>
                <li><strong>Social Links (Coaches):</strong> Add or update social media profiles</li>
              </ul>

              <h3 className="client-card__subsection-title">4.4 Notification Preferences</h3>
              <p>
                Manage how you receive updates:
              </p>
              <ul className="client-list">
                <li>In-app notifications for important account activities</li>
                <li>Email notifications for subscription changes and updates</li>
                <li>Customize notification frequency in your settings</li>
                <li>Mark notifications as read to keep your inbox organized</li>
              </ul>

              <h3 className="client-card__subsection-title">4.5 Account Deactivation</h3>
              <p>
                If you need to temporarily deactivate your account:
              </p>
              <ul className="client-list">
                <li>Contact support at mail.pulseledger@gmail.com</li>
                <li>Specify if you want to reactivate later</li>
                <li>Complete any pending subscriptions or orders first</li>
                <li>Admins can deactivate accounts that violate our policies</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Troubleshooting */}
          <div className="client-card">
            <h2 className="client-card__section-title">5. Common Issues & Troubleshooting</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">5.1 Login Problems</h3>
              <div className="client-faq">
                <h4 className="client-faq__question">I can't log in to my account</h4>
                <div className="client-faq__answer">
                  <p><strong>Possible Solutions:</strong></p>
                  <ul className="client-list">
                    <li>Verify you're using the correct email address</li>
                    <li>Check for typos in your password (passwords are case-sensitive)</li>
                    <li>Use the "Forgot Password" feature to reset your password</li>
                    <li>Ensure your account is verified (check your email for verification code)</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Try a different browser or device</li>
                    <li>If your account was deactivated, contact support</li>
                  </ul>
                </div>
              </div>

              <div className="client-faq">
                <h4 className="client-faq__question">My verification code expired</h4>
                <div className="client-faq__answer">
                  <p>Verification codes are valid for 10 minutes. If yours expired:</p>
                  <ul className="client-list">
                    <li>Return to the verification page</li>
                    <li>Click "Resend Verification Code"</li>
                    <li>Check your email for the new 6-digit code</li>
                    <li>Enter it promptly to verify your account</li>
                  </ul>
                </div>
              </div>

              <h3 className="client-card__subsection-title">5.2 Subscription Issues</h3>
              <div className="client-faq">
                <h4 className="client-faq__question">My subscription is stuck in "Pending" status</h4>
                <div className="client-faq__answer">
                  <p>Subscriptions require both coach and admin approval:</p>
                  <ul className="client-list">
                    <li>Wait for your coach to approve the subscription request</li>
                    <li>Ensure you've completed payment using your coach's method</li>
                    <li>Admin approval typically takes 1-2 business days after coach approval</li>
                    <li>Contact your coach to confirm they've received your payment</li>
                    <li>If delayed beyond 3-5 days, email support at mail.pulseledger@gmail.com</li>
                  </ul>
                </div>
              </div>

              <div className="client-faq">
                <h4 className="client-faq__question">I paid but my subscription isn't active</h4>
                <div className="client-faq__answer">
                  <ul className="client-list">
                    <li>Confirm payment with your coach (share payment receipt)</li>
                    <li>Ask your coach to approve the subscription in their dashboard</li>
                    <li>Wait for admin verification (usually completed within 1-2 business days)</li>
                    <li>Check your subscription status in your client dashboard</li>
                    <li>Contact support if the issue persists after 72 hours</li>
                  </ul>
                </div>
              </div>

              <h3 className="client-card__subsection-title">5.3 Payment & Refund Issues</h3>
              <div className="client-faq">
                <h4 className="client-faq__question">How do I request a refund?</h4>
                <div className="client-faq__answer">
                  <p>PulseLedger operates as a platform facilitator. For refunds:</p>
                  <ol className="client-list">
                    <li><strong>Contact Your Coach First:</strong> All refunds are handled by coaches directly</li>
                    <li>Explain your reason for requesting a refund</li>
                    <li>Provide payment proof and subscription details</li>
                    <li>Allow your coach 5-7 business days to process</li>
                    <li>If your coach is unresponsive after 7 days, contact mail.pulseledger@gmail.com</li>
                    <li>PulseLedger can mediate but cannot force refunds</li>
                  </ol>
                  <p>See our <Link href="/footer-pages/refund-policy" className="client-link">Refund Policy</Link> for complete details on eligibility and timeframes.</p>
                </div>
              </div>

              <div className="client-faq">
                <h4 className="client-faq__question">I was charged twice</h4>
                <div className="client-faq__answer">
                  <p>For duplicate payment issues:</p>
                  <ul className="client-list">
                    <li>Check your bank statement to confirm duplicate charges</li>
                    <li>Contact your coach immediately with payment proof</li>
                    <li>Coaches should refund duplicate payments within 5-7 business days</li>
                    <li>If unresolved, contact PulseLedger support with evidence</li>
                  </ul>
                </div>
              </div>

              <h3 className="client-card__subsection-title">5.4 Technical Issues</h3>
              <div className="client-faq">
                <h4 className="client-faq__question">The website is loading slowly or not working</h4>
                <div className="client-faq__answer">
                  <ul className="client-list">
                    <li>Check your internet connection</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Try a different browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>Disable browser extensions that might interfere</li>
                    <li>Try accessing from a different device</li>
                    <li>If issues persist, report to mail.pulseledger@gmail.com</li>
                  </ul>
                </div>
              </div>

              <div className="client-faq">
                <h4 className="client-faq__question">I can't upload photos or images</h4>
                <div className="client-faq__answer">
                  <p><strong>Image Upload Requirements:</strong></p>
                  <ul className="client-list">
                    <li>Maximum file size: 10MB per image</li>
                    <li>Supported formats: JPG, JPEG, PNG, WebP</li>
                    <li>Ensure stable internet connection during upload</li>
                    <li>Try compressing large images before uploading</li>
                    <li>Check if you've reached any storage limits</li>
                  </ul>
                </div>
              </div>

              <div className="client-faq">
                <h4 className="client-faq__question">My data isn't saving</h4>
                <div className="client-faq__answer">
                  <ul className="client-list">
                    <li>Ensure you click "Save" or "Update" after making changes</li>
                    <li>Wait for confirmation message before navigating away</li>
                    <li>Check your internet connection stability</li>
                    <li>Avoid using browser back button immediately after saving</li>
                    <li>Try logging out and back in to refresh your session</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Privacy & Security */}
          <div className="client-card">
            <h2 className="client-card__section-title">6. Privacy & Security</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">6.1 Data Protection</h3>
              <p>
                PulseLedger takes your privacy seriously:
              </p>
              <ul className="client-list">
                <li><strong>Encryption:</strong> All passwords are encrypted using bcrypt (10-16 salt rounds)</li>
                <li><strong>Secure Transmission:</strong> Data transmitted over HTTPS with SSL/TLS encryption</li>
                <li><strong>JWT Authentication:</strong> Secure token-based authentication system</li>
                <li><strong>Database Security:</strong> MongoDB with strict access controls and sanitization</li>
                <li><strong>Cloud Storage:</strong> Images stored securely on Cloudinary with access controls</li>
                <li><strong>Rate Limiting:</strong> Protection against brute force attacks (50-100 requests per window)</li>
                <li><strong>XSS Protection:</strong> Input sanitization prevents cross-site scripting</li>
                <li><strong>NoSQL Injection Prevention:</strong> Query sanitization protects database</li>
              </ul>

              <h3 className="client-card__subsection-title">6.2 What Data We Collect</h3>
              <p>
                See our <Link href="/footer-pages/privacy-policy" className="client-link">Privacy Policy</Link> for complete details. We collect:
              </p>
              <ul className="client-list">
                <li><strong>Account Data:</strong> Name, email, password, role, verification status</li>
                <li><strong>Health Data (Clients):</strong> Age, gender, height, weight, BMI, water intake, progress photos</li>
                <li><strong>Professional Data (Coaches):</strong> Experience, certifications, specialization, portfolio</li>
                <li><strong>Usage Data:</strong> Login history, session data, feature usage</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Communication Data:</strong> Messages, notifications, support inquiries</li>
              </ul>

              <h3 className="client-card__subsection-title">6.3 Your Privacy Rights</h3>
              <ul className="client-list">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain data processing activities</li>
                <li><strong>Restriction:</strong> Request restriction of data processing</li>
              </ul>
              <p>To exercise these rights, contact mail.pulseledger@gmail.com</p>

              <h3 className="client-card__subsection-title">6.4 Keeping Your Account Secure</h3>
              <p><strong>Best Practices:</strong></p>
              <ul className="client-list">
                <li>Use a strong, unique password (mix of letters, numbers, symbols)</li>
                <li>Never share your password with anyone, including coaches or support</li>
                <li>Log out when using shared or public devices</li>
                <li>Enable two-factor authentication if available</li>
                <li>Review your account activity regularly</li>
                <li>Update your password every 3-6 months</li>
                <li>Be cautious of phishing emails pretending to be from PulseLedger</li>
                <li>Report suspicious activity immediately to mail.pulseledger@gmail.com</li>
              </ul>
            </div>
          </div>

          {/* Section 7: Policies & Guidelines */}
          <div className="client-card">
            <h2 className="client-card__section-title">7. Policies & Guidelines</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">7.1 Important Policies</h3>
              <p>
                Please review these important documents:
              </p>
              <ul className="client-list">
                <li><Link href="/footer-pages/terms-and-conditions" className="client-link">Terms & Conditions</Link> - Legal agreement governing platform use</li>
                <li><Link href="/footer-pages/privacy-policy" className="client-link">Privacy Policy</Link> - How we collect, use, and protect your data</li>
                <li><Link href="/footer-pages/refund-policy" className="client-link">Refund Policy</Link> - Eligibility and process for refunds</li>
              </ul>

              <h3 className="client-card__subsection-title">7.2 Acceptable Use</h3>
              <p><strong>Users must NOT:</strong></p>
              <ul className="client-list">
                <li>Share false or misleading information</li>
                <li>Impersonate others or create fake accounts</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Upload inappropriate, offensive, or illegal content</li>
                <li>Attempt to hack, breach security, or access unauthorized areas</li>
                <li>Use the platform for spam or unauthorized marketing</li>
                <li>Violate intellectual property rights</li>
                <li>Manipulate or game the system</li>
              </ul>
              <p>Violations may result in account suspension or termination.</p>

              <h3 className="client-card__subsection-title">7.3 Medical Disclaimer</h3>
              <p className="client-card__alert">
                <strong>Important:</strong> PulseLedger is a coaching platform, NOT a medical service. Content provided through the platform is for informational and fitness purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals before starting any fitness program, changing your diet, or taking supplements, especially if you have pre-existing health conditions, are pregnant, or are taking medications.
              </p>

              <h3 className="client-card__subsection-title">7.4 Coach Qualifications</h3>
              <p>
                While we encourage coaches to display certifications and qualifications, PulseLedger does not independently verify coach credentials. Clients should:
              </p>
              <ul className="client-list">
                <li>Review coach profiles and qualifications carefully</li>
                <li>Ask coaches about their training and experience</li>
                <li>Request to see certifications before committing</li>
                <li>Report unqualified or fraudulent coaches to support</li>
              </ul>
            </div>
          </div>

          {/* Section 8: FAQs */}
          <div className="client-card">
            <h2 className="client-card__section-title">8. Frequently Asked Questions (FAQs)</h2>
            <div className="client-card__content">
              <div className="client-faqs">
                <div className="client-faq">
                  <h3 className="client-faq__question">Is PulseLedger free to use?</h3>
                  <p className="client-faq__answer">
                    Creating an account on PulseLedger is free. However, coaching plans and subscriptions are paid services set by individual coaches. Product purchases also have associated costs.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">How long does subscription approval take?</h3>
                  <p className="client-faq__answer">
                    Once you submit payment to your coach and they approve the subscription, admin approval typically takes 1-2 business days. The entire process usually completes within 3-5 business days from payment.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">Can I switch coaches?</h3>
                  <p className="client-faq__answer">
                    Yes, clients can work with different coaches. However, active subscriptions remain with the original coach until they expire. You can connect with a new coach for future subscriptions.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">What payment methods are accepted?</h3>
                  <p className="client-faq__answer">
                    PulseLedger doesn't process payments directly. Coaches accept payments via their preferred methods (UPI, bank transfer, cash, etc.). Check with your coach for their accepted payment methods.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">How do I cancel my subscription?</h3>
                  <p className="client-faq__answer">
                    Contact your coach directly to discuss subscription cancellation. Refer to our Refund Policy for information about potential refunds based on subscription status (pending, active, or expired).
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">Is my health data private?</h3>
                  <p className="client-faq__answer">
                    Yes. Your health data is only visible to you, your assigned coach (if you have one), and platform administrators for support purposes. We use industry-standard encryption and security measures to protect your information.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">Can I delete my account?</h3>
                  <p className="client-faq__answer">
                    Yes. Contact support at mail.pulseledger@gmail.com to request account deletion. Ensure all active subscriptions and pending orders are resolved first. Some data may be retained for legal compliance purposes.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">What should I do if I face a problem with my coach?</h3>
                  <p className="client-faq__answer">
                    First, try to resolve the issue directly with your coach through communication. If the issue persists or involves policy violations, contact PulseLedger support at mail.pulseledger@gmail.com. We can mediate disputes but coaches operate independently.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">How often should I update my progress?</h3>
                  <p className="client-faq__answer">
                    We recommend logging weight and water intake weekly, and uploading progress photos every 2-4 weeks. However, frequency depends on your coach's recommendations and your personal preferences.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">Can coaches see my progress photos?</h3>
                  <p className="client-faq__answer">
                    Yes, your assigned coach can view your progress photos and health metrics to better guide your fitness journey. Photos are not visible to other users or coaches.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">What happens when my subscription expires?</h3>
                  <p className="client-faq__answer">
                    When your subscription expires, you lose access to your coach's exclusive content and direct coaching. However, your account, progress history, and data remain intact. You can renew with the same coach or subscribe to a different coach's plan.
                  </p>
                </div>

                <div className="client-faq">
                  <h3 className="client-faq__question">How do I become a coach on PulseLedger?</h3>
                  <p className="client-faq__answer">
                    Register for a coach account and complete your professional profile with certifications, experience, and specializations. Once approved, you can create plans, accept clients, and start coaching.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: Contact Support */}
          <div className="client-card">
            <h2 className="client-card__section-title">9. Contact Support</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">9.1 When to Contact Support</h3>
              <p>Reach out to PulseLedger support for:</p>
              <ul className="client-list">
                <li>Technical issues with the platform</li>
                <li>Account access problems</li>
                <li>Billing discrepancies</li>
                <li>Disputes that couldn't be resolved with your coach</li>
                <li>Reporting policy violations or inappropriate behavior</li>
                <li>Feature requests and feedback</li>
                <li>Privacy concerns or data access requests</li>
              </ul>

              <h3 className="client-card__subsection-title">9.2 How to Contact Us</h3>
              <p><strong>Email Support:</strong></p>
              <ul className="client-list">
                <li><strong>Email:</strong> <a href="mailto:mail.pulseledger@gmail.com" className="client-link">mail.pulseledger@gmail.com</a></li>
                <li><strong>Response Time:</strong> We aim to respond within 1-2 business days</li>
                <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</li>
              </ul>

              <p><strong>Contact Form:</strong></p>
              <ul className="client-list">
                <li>Visit our <Link href="/footer-pages/contact" className="client-link">Contact Us</Link> page</li>
                <li>Fill out the contact form with your name, email, and message</li>
                <li>Include relevant details (account email, subscription ID, order number, etc.)</li>
                <li>We'll respond via email within 1-2 business days</li>
              </ul>

              <h3 className="client-card__subsection-title">9.3 What to Include in Your Support Request</h3>
              <p>To help us assist you faster, please provide:</p>
              <ul className="client-list">
                <li>Your registered email address</li>
                <li>Detailed description of the issue</li>
                <li>Screenshots or screen recordings (if applicable)</li>
                <li>Steps you've already tried to resolve the issue</li>
                <li>Browser and device information (for technical issues)</li>
                <li>Relevant IDs (subscription ID, order ID, etc.)</li>
                <li>Preferred contact method for follow-up</li>
              </ul>

              <h3 className="client-card__subsection-title">9.4 Feedback and Suggestions</h3>
              <p>
                We're always looking to improve PulseLedger. Share your feedback, feature requests, or suggestions at mail.pulseledger@gmail.com. Your input helps us build a better platform for the entire fitness community.
              </p>
            </div>
          </div>

          {/* Section 10: Additional Resources */}
          <div className="client-card">
            <h2 className="client-card__section-title">10. Additional Resources</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">10.1 Related Pages</h3>
              <ul className="client-list">
                <li><Link href="/footer-pages/about" className="client-link">About PulseLedger</Link> - Learn about our mission and values</li>
                <li><Link href="/footer-pages/terms-and-conditions" className="client-link">Terms & Conditions</Link> - Legal terms governing platform use</li>
                <li><Link href="/footer-pages/privacy-policy" className="client-link">Privacy Policy</Link> - How we handle your data</li>
                <li><Link href="/footer-pages/refund-policy" className="client-link">Refund Policy</Link> - Refund eligibility and procedures</li>
                <li><Link href="/footer-pages/contact" className="client-link">Contact Us</Link> - Get in touch with support</li>
              </ul>

              <h3 className="client-card__subsection-title">10.2 Platform Features Overview</h3>
              <p><strong>For Clients:</strong></p>
              <ul className="client-list">
                <li>Browse and connect with certified coaches</li>
                <li>Subscribe to personalized coaching plans (1-52 weeks)</li>
                <li>Track weight, height, BMI, and water intake</li>
                <li>Upload and review progress photos</li>
                <li>Purchase fitness products and supplements</li>
                <li>Use discount vouchers for savings</li>
                <li>Receive in-app notifications</li>
                <li>Access coach's exclusive content and guidance</li>
              </ul>

              <p><strong>For Coaches:</strong></p>
              <ul className="client-list">
                <li>Create and customize coaching plans</li>
                <li>Manage client subscriptions and progress</li>
                <li>Sell fitness products and supplements</li>
                <li>Generate and share referral codes</li>
                <li>Build professional portfolio with transformations</li>
                <li>Track contact requests and client inquiries</li>
                <li>Create discount vouchers for promotions</li>
                <li>Receive notifications for client activities</li>
              </ul>

              <h3 className="client-card__subsection-title">10.3 System Requirements</h3>
              <p><strong>Supported Browsers:</strong></p>
              <ul className="client-list">
                <li>Google Chrome (recommended, latest version)</li>
                <li>Mozilla Firefox (latest version)</li>
                <li>Safari (latest version, macOS and iOS)</li>
                <li>Microsoft Edge (latest version)</li>
              </ul>

              <p><strong>Device Compatibility:</strong></p>
              <ul className="client-list">
                <li>Desktop computers (Windows, macOS, Linux)</li>
                <li>Laptops and notebooks</li>
                <li>Tablets (iPad, Android tablets)</li>
                <li>Smartphones (iOS, Android)</li>
              </ul>

              <p><strong>Internet Connection:</strong></p>
              <ul className="client-list">
                <li>Minimum: 1 Mbps for basic functionality</li>
                <li>Recommended: 5+ Mbps for optimal experience</li>
                <li>Required for image uploads and real-time updates</li>
              </ul>
            </div>
          </div>

          {/* Final CTA */}
          <div className="client-card" style={{ textAlign: "center", backgroundColor: "#f8fafc", padding: "2rem" }}>
            <h2 className="client-card__section-title">Still Have Questions?</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              If you couldn't find the answer you were looking for, our support team is here to help. We typically respond within 1-2 business days.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/footer-pages/contact" className="btn btn--primary" style={{ textDecoration: "none" }}>
                Contact Support
              </Link>
              <a href="mailto:mail.pulseledger@gmail.com" className="btn btn--outline" style={{ textDecoration: "none" }}>
                Email Us Directly
              </a>
            </div>
          </div>
        </section>
    </main>
  );
}
