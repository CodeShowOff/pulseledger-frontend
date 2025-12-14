import React from "react";

export default function RefundPolicyPage() {
  return (
    <main className="client-page footer-page">
      <header className="client-page__header">
        <h1 className="client-page__title">Refund & Cancellation Policy</h1>
      </header>

        <section className="client-page__sections">
          {/* Section 1: Platform Role */}
          <div className="client-card">
            <h2 className="client-card__section-title">1. PulseLedger's Role as a Platform</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">1.1 Platform Facilitator</h3>
              <p><strong>IMPORTANT:</strong> PulseLedger operates as a technology platform that connects health and fitness coaches with clients. We facilitate the relationship between coaches and clients but do not directly provide coaching services or sell products.</p>

              <h3 className="client-card__subsection-title">1.2 Independent Coaches</h3>
              <ul className="client-list">
                <li>Coaches on PulseLedger are independent professionals who set their own prices, refund policies, and terms for their services and products</li>
                <li>All payments for subscriptions and products go directly to your assigned coach, not to PulseLedger</li>
                <li>Each coach may have their own refund policies and timelines in addition to the guidelines outlined here</li>
                <li>PulseLedger does not collect, hold, or process payments on behalf of coaches (payments are made directly via coach-provided payment methods such as UPI QR codes)</li>
              </ul>

              <h3 className="client-card__subsection-title">1.3 Coach Autonomy</h3>
              <ul className="client-list">
                <li>Coaches have full discretion over granting or denying refund requests for their services and products</li>
                <li>Refund decisions are made by individual coaches based on their professional judgment and policies</li>
                <li>PulseLedger cannot force coaches to issue refunds but encourages fair and reasonable refund practices</li>
              </ul>
            </div>
          </div>

          {/* Section 2: How to Request Refunds */}
          <div className="client-card">
            <h2 className="client-card__section-title">2. How to Request a Refund</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">2.1 Contact Your Coach First</h3>
              <p><strong>Primary Refund Process:</strong></p>
              <ul className="client-list">
                <li><strong>Step 1:</strong> Contact your assigned coach directly through the platform or via their provided contact methods (phone, WhatsApp, email, social media)</li>
                <li><strong>Step 2:</strong> Explain your reason for requesting a refund clearly and professionally</li>
                <li><strong>Step 3:</strong> Provide any necessary documentation (subscription details, order numbers, payment receipts)</li>
                <li><strong>Step 4:</strong> Allow your coach reasonable time to review and respond to your request (typically 5-7 business days)</li>
                <li><strong>Step 5:</strong> If approved, coordinate refund method and timeline with your coach</li>
              </ul>

              <h3 className="client-card__subsection-title">2.2 Information to Include in Refund Requests</h3>
              <p>When contacting your coach about a refund, please provide:</p>
              <ul className="client-list">
                <li>Your full name and account email address</li>
                <li>Subscription ID or Order ID (visible in your account dashboard)</li>
                <li>Date of payment and amount paid</li>
                <li>Payment method used (UPI, cash, etc.)</li>
                <li>Payment proof or transaction reference</li>
                <li>Clear reason for refund request</li>
                <li>Preferred refund method (same payment method, bank transfer, etc.)</li>
              </ul>

              <h3 className="client-card__subsection-title">2.3 Response Timeline</h3>
              <ul className="client-list">
                <li>Coaches should respond to refund requests within 5-7 business days</li>
                <li>If your coach does not respond within 10 business days, you may escalate to PulseLedger support</li>
                <li>Complex refund requests may require additional time for review</li>
              </ul>

              <h3 className="client-card__subsection-title">2.4 Escalation to PulseLedger</h3>
              <p>If you cannot resolve a refund issue directly with your coach, you may contact PulseLedger support:</p>
              <ul className="client-list">
                <li><strong>Email:</strong> mail.pulseledger@gmail.com</li>
                <li><strong>Subject Line:</strong> "Refund Dispute - [Your Name]"</li>
                <li><strong>Include:</strong> All communication history with your coach, payment documentation, and detailed explanation</li>
                <li><strong>Response Time:</strong> We will investigate and respond within 7-10 business days</li>
              </ul>
              <p><strong>Note:</strong> PulseLedger will mediate disputes but cannot guarantee refunds, as final decisions rest with individual coaches. We may suspend coaches who repeatedly violate fair refund practices.</p>
            </div>
          </div>

          {/* Section 3: Subscription Refunds */}
          <div className="client-card">
            <h2 className="client-card__section-title">3. Coaching Subscription Refunds</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">3.1 General Subscription Refund Policy</h3>
              <ul className="client-list">
                <li>Subscription refunds are subject to coach approval and their individual refund policies</li>
                <li>Refund eligibility typically depends on subscription status, duration of use, and reason for request</li>
                <li>Most coaches offer refunds for unused portions of subscriptions under certain conditions</li>
              </ul>

              <h3 className="client-card__subsection-title">3.2 Pending Subscriptions</h3>
              <ul className="client-list">
                <li><strong>Status:</strong> Subscriptions awaiting coach approval after payment submission</li>
                <li><strong>Refund Eligibility:</strong> Generally eligible for full refund (100%)</li>
                <li><strong>Process:</strong> Contact your coach to request cancellation and refund before approval</li>
                <li><strong>Timeline:</strong> Should be processed within 3-5 business days</li>
                <li><strong>Note:</strong> Cancelling a pending subscription through your dashboard may not automatically trigger a refund; you must request it from your coach</li>
              </ul>

              <h3 className="client-card__subsection-title">3.3 Active Subscriptions - Early Cancellation</h3>
              <ul className="client-list">
                <li><strong>Status:</strong> Approved subscriptions currently in the active period</li>
                <li><strong>Refund Eligibility:</strong> Varies by coach and circumstances</li>
                <li><strong>Common Scenarios:</strong>
                  <ul className="client-list">
                    <li><strong>Within 7 Days of Start Date:</strong> May be eligible for partial or full refund (subject to coach policy)</li>
                    <li><strong>Medical/Emergency Reasons:</strong> Often eligible for prorated refund for unused weeks</li>
                    <li><strong>Dissatisfaction with Service:</strong> Evaluated case-by-case by coach</li>
                    <li><strong>After 50% Duration Elapsed:</strong> Typically no refund (service substantially consumed)</li>
                  </ul>
                </li>
              </ul>

              <h3 className="client-card__subsection-title">3.4 Prorated Refunds</h3>
              <ul className="client-list">
                <li>Prorated refunds calculate the unused portion of your subscription</li>
                <li><strong>Formula:</strong> (Remaining Weeks / Total Weeks) × Subscription Amount</li>
                <li><strong>Example:</strong> 4-week subscription at ₹2,000, cancelled after 1 week = (3/4) × ₹2,000 = ₹1,500 potential refund</li>
                <li>Coaches may deduct a processing fee or minimum service fee from prorated refunds</li>
                <li>Final prorated amount is at coach's discretion</li>
              </ul>

              <h3 className="client-card__subsection-title">3.5 Free and Default Plans</h3>
              <ul className="client-list">
                <li>Free plans (₹0 subscriptions) have no refund implications as no payment was made</li>
                <li>Default template plans assigned by coaches are free and can be cancelled anytime without refund concerns</li>
              </ul>

              <h3 className="client-card__subsection-title">3.6 Non-Refundable Subscriptions</h3>
              <p>Subscriptions are generally NOT eligible for refund in these cases:</p>
              <ul className="client-list">
                <li>Subscription has expired (end date passed)</li>
                <li>Subscription was explicitly marked as "non-refundable" at time of purchase</li>
                <li>Subscription was purchased with a significant discount or promotional voucher</li>
                <li>Client violated Terms of Service or coaching agreement</li>
                <li>More than 50% of subscription duration has elapsed</li>
                <li>Subscription was rejected by coach (no payment was processed)</li>
              </ul>

              <h3 className="client-card__subsection-title">3.7 Subscription Cancellation Process</h3>
              <ul className="client-list">
                <li><strong>Self-Service Cancellation:</strong> You can cancel subscriptions through your dashboard under "My Subscriptions"</li>
                <li><strong>Effect:</strong> Cancellation immediately changes subscription status to "Cancelled" and may set end date to current date</li>
                <li><strong>Refund:</strong> Cancellation does NOT automatically trigger a refund; you must separately request a refund from your coach</li>
                <li><strong>Access:</strong> Upon cancellation, you lose access to subscription-specific features</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Product Order Refunds */}
          <div className="client-card">
            <h2 className="client-card__section-title">4. Product Order Refunds</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">4.1 Product Refund Policy</h3>
              <ul className="client-list">
                <li>Product refunds are entirely at the discretion of your coach, who is the seller</li>
                <li>Each coach may have different policies for product returns and refunds</li>
                <li>PulseLedger recommends but cannot enforce specific product refund terms</li>
              </ul>

              <h3 className="client-card__subsection-title">4.2 Pending Orders</h3>
              <ul className="client-list">
                <li><strong>Status:</strong> Order placed, payment submitted, awaiting coach approval</li>
                <li><strong>Refund Eligibility:</strong> Generally eligible for full refund (100%)</li>
                <li><strong>Process:</strong> Contact your coach immediately to cancel order and request refund</li>
                <li><strong>Timeline:</strong> Should be processed within 3-5 business days</li>
              </ul>

              <h3 className="client-card__subsection-title">4.3 Approved and Fulfilled Orders</h3>
              <ul className="client-list">
                <li><strong>Status:</strong> Order confirmed by coach, products being prepared or ready for delivery</li>
                <li><strong>Refund Eligibility:</strong> Depends on coach policy and order status</li>
                <li><strong>Common Scenarios:</strong>
                  <ul className="client-list">
                    <li><strong>Before Shipment/Delivery:</strong> May be eligible for full or partial refund</li>
                    <li><strong>After Delivery:</strong> Subject to return policy (see Section 4.4)</li>
                    <li><strong>Perishable Items:</strong> Typically non-refundable after preparation</li>
                  </ul>
                </li>
              </ul>

              <h3 className="client-card__subsection-title">4.4 Product Returns and Exchanges</h3>
              <ul className="client-list">
                <li><strong>Defective Products:</strong> Contact your coach immediately for replacement or refund</li>
                <li><strong>Wrong Product:</strong> Coach should replace with correct product or issue full refund</li>
                <li><strong>Damaged in Transit:</strong> Report to coach within 24-48 hours with photos for refund/replacement</li>
                <li><strong>Change of Mind:</strong> Return eligibility depends on coach's policy; many coaches do not accept returns for change of mind on health products</li>
                <li><strong>Unopened Products:</strong> More likely to be eligible for return within 7-14 days</li>
                <li><strong>Opened/Used Products:</strong> Generally non-refundable due to health and safety regulations</li>
              </ul>

              <h3 className="client-card__subsection-title">4.5 Return Shipping</h3>
              <ul className="client-list">
                <li>Return shipping costs are typically borne by the client unless product was defective or incorrect</li>
                <li>Arrange return shipping method with your coach</li>
                <li>Insure valuable returns to protect against loss</li>
              </ul>

              <h3 className="client-card__subsection-title">4.6 Completed Orders</h3>
              <ul className="client-list">
                <li><strong>Status:</strong> Order delivered and marked as complete</li>
                <li><strong>Refund Eligibility:</strong> Limited; only for defects, damage, or quality issues</li>
                <li><strong>Window:</strong> Typically 7 days from delivery date to report issues</li>
                <li><strong>Evidence:</strong> Photos, videos, or documentation may be required</li>
              </ul>

              <h3 className="client-card__subsection-title">4.7 Cancelled or Rejected Orders</h3>
              <ul className="client-list">
                <li>If coach cancels or rejects your order, you are entitled to a full refund</li>
                <li>Refund should be processed within 5-7 business days</li>
                <li>Contact coach if refund is not initiated promptly</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Platform Subscription Refunds (Coaches) */}
          <div className="client-card">
            <h2 className="client-card__section-title">5. Platform Subscription Fee Refunds (For Coaches)</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">5.1 About Platform Subscription</h3>
              <p>
                Coaches on PulseLedger are required to maintain an active platform subscription to access coaching features and manage clients. The platform subscription fee is ₹99 per month with a 28-day free trial for new coaches.
              </p>

              <h3 className="client-card__subsection-title">5.2 Platform Subscription Refund Policy</h3>
              <ul className="client-list">
                <li><strong>Free Trial Period:</strong> No charges during the 28-day trial period, so no refunds apply</li>
                <li><strong>Payment Submission:</strong> When coaches submit platform subscription payments, they upload payment proof and transaction details</li>
                <li><strong>Pending Payments:</strong> Payments awaiting admin approval can be cancelled with full refund (₹99) by contacting PulseLedger support</li>
                <li><strong>Approved Payments:</strong> Once approved by admin, platform subscription is activated for 30 days</li>
              </ul>

              <h3 className="client-card__subsection-title">5.3 Refund Eligibility for Platform Subscription</h3>
              <ul className="client-list">
                <li><strong>Before Approval:</strong> Full refund (100%) available if cancelled before admin approval</li>
                <li><strong>Within 7 Days of Activation:</strong> Prorated refund may be available based on unused days (subject to admin review)</li>
                <li><strong>After 7 Days:</strong> Generally non-refundable as platform access and features have been provided</li>
                <li><strong>Technical Issues:</strong> If platform is unavailable or has critical issues preventing use, prorated refunds may be granted</li>
                <li><strong>Account Suspension:</strong> If account is suspended due to policy violations, no refund will be issued</li>
              </ul>

              <h3 className="client-card__subsection-title">5.4 How to Request Platform Subscription Refund</h3>
              <ul className="client-list">
                <li><strong>Contact:</strong> Email mail.pulseledger@gmail.com with subject "Platform Subscription Refund Request"</li>
                <li><strong>Required Information:</strong>
                  <ul className="client-list">
                    <li>Coach name and email address</li>
                    <li>Payment transaction ID and date</li>
                    <li>Payment proof screenshot</li>
                    <li>Reason for refund request</li>
                    <li>Subscription activation date (if applicable)</li>
                  </ul>
                </li>
                <li><strong>Response Time:</strong> We will review and respond within 5-7 business days</li>
                <li><strong>Processing:</strong> Approved refunds will be processed within 10-15 business days</li>
              </ul>

              <h3 className="client-card__subsection-title">5.5 Platform Subscription Extensions</h3>
              <ul className="client-list">
                <li>Admin may grant subscription extensions for legitimate reasons (technical issues, medical emergencies)</li>
                <li>Extensions do not create automatic refund eligibility for current payments</li>
                <li>Contact support at mail.pulseledger@gmail.com to request extensions with valid justification</li>
              </ul>

              <h3 className="client-card__subsection-title">5.6 Non-Refundable Situations</h3>
              <p>Platform subscription fees are NOT refundable in these cases:</p>
              <ul className="client-list">
                <li>Account terminated for Terms of Service violations</li>
                <li>Fraudulent payment proof or false transaction information</li>
                <li>After subscription period has fully expired</li>
                <li>More than 50% of subscription period has elapsed</li>
                <li>Coach voluntarily closes account after approval (no automatic refund)</li>
                <li>Promotional or discounted subscription fees (if offered in future)</li>
              </ul>

              <h3 className="client-card__subsection-title">5.7 Rejected Payments</h3>
              <ul className="client-list">
                <li>If admin rejects a platform subscription payment (invalid proof, incorrect amount, etc.), full refund will be initiated</li>
                <li>Rejection reason will be communicated via email</li>
                <li>Coach may resubmit payment with correct information</li>
                <li>Refund processing: 7-10 business days from rejection date</li>
              </ul>
            </div>
          </div>

          {/* Section 6: Refund Processing */}
          <div className="client-card">
            <h2 className="client-card__section-title">6. Refund Processing and Timeline</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">5.1 Refund Methods</h3>
              <ul className="client-list">
                <li><strong>Original Payment Method:</strong> Refunds are typically processed using the same method you used to pay (UPI, bank transfer, cash)</li>
                <li><strong>UPI Refunds:</strong> Returned to the UPI ID or account you paid from</li>
                <li><strong>Cash Refunds:</strong> May be returned in cash during in-person meetings or via bank transfer</li>
                <li><strong>Alternative Methods:</strong> Coach may offer alternative refund methods by mutual agreement</li>
              </ul>

              <h3 className="client-card__subsection-title">5.2 Refund Timeline</h3>
              <ul className="client-list">
                <li><strong>Coach Approval:</strong> 5-7 business days for coach to review and approve/deny refund request</li>
                <li><strong>Processing:</strong> 5-10 business days for coach to initiate refund after approval</li>
                <li><strong>Bank Processing:</strong> Additional 3-7 business days for funds to appear in your account (depends on bank/payment method)</li>
                <li><strong>Total Timeline:</strong> Expect 10-21 business days for complete refund process</li>
                <li><strong>Faster Processing:</strong> UPI and digital payments typically process faster than bank transfers</li>
              </ul>

              <h3 className="client-card__subsection-title">5.3 Refund Confirmation</h3>
              <ul className="client-list">
                <li>Your coach should provide confirmation when refund is initiated</li>
                <li>Keep records of all refund communications and transaction references</li>
                <li>Verify refund receipt in your bank account or payment app</li>
                <li>Contact your coach if refund does not arrive within expected timeline</li>
              </ul>

              <h3 className="client-card__subsection-title">5.4 Partial Refunds</h3>
              <ul className="client-list">
                <li>Coaches may issue partial refunds for prorated services or partial order cancellations</li>
                <li>Deductions may be made for services rendered, processing fees, or restocking charges</li>
                <li>Partial refund amounts should be clearly communicated before processing</li>
              </ul>

              <h3 className="client-card__subsection-title">5.5 Refund Tracking</h3>
              <ul className="client-list">
                <li>Currently, refunds are not tracked within the PulseLedger platform as they occur directly between you and your coach</li>
                <li>Keep personal records of refund requests and confirmations</li>
                <li>Save transaction receipts and communication records for your files</li>
              </ul>
            </div>
          </div>

          {/* Section 7: Special Circumstances */}
          <div className="client-card">
            <h2 className="client-card__section-title">7. Special Circumstances and Exceptions</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">6.1 Medical or Emergency Situations</h3>
              <ul className="client-list">
                <li>If you experience a medical emergency, injury, or health condition that prevents you from continuing services, inform your coach immediately</li>
                <li>Most coaches are understanding and will work with you on refunds or service pauses</li>
                <li>Medical documentation may be requested to support your claim</li>
                <li>Prorated refunds are often granted in genuine medical situations</li>
              </ul>

              <h3 className="client-card__subsection-title">6.2 Coach Unavailability</h3>
              <ul className="client-list">
                <li>If your coach becomes unavailable or discontinues services during your active subscription, you may be entitled to a full or prorated refund</li>
                <li>Contact PulseLedger support at mail.pulseledger@gmail.com if your coach becomes unresponsive</li>
                <li>We will attempt to mediate or facilitate reassignment to another coach with your consent</li>
              </ul>

              <h3 className="client-card__subsection-title">6.3 Technical Issues or Platform Errors</h3>
              <ul className="client-list">
                <li><strong>Duplicate Charges:</strong> If you were charged twice for the same subscription or order, contact your coach and PulseLedger immediately for full refund of duplicate amount</li>
                <li><strong>Payment Processing Errors:</strong> Platform or payment gateway errors resulting in incorrect charges will be fully refunded</li>
                <li><strong>Account Access Issues:</strong> If technical issues prevent you from accessing paid services, refunds may be granted for affected period</li>
                <li><strong>Reporting:</strong> Report technical issues to mail.pulseledger@gmail.com with screenshots and transaction details</li>
              </ul>

              <h3 className="client-card__subsection-title">6.4 Service Quality Issues</h3>
              <ul className="client-list">
                <li>If you believe coaching services are not meeting professional standards or agreed-upon terms, discuss with your coach first</li>
                <li>Document specific concerns and attempts to resolve issues</li>
                <li>If unresolved, escalate to PulseLedger support with detailed information</li>
                <li>We may investigate and facilitate resolution, including possible refunds</li>
              </ul>

              <h3 className="client-card__subsection-title">6.5 Promotional and Discounted Purchases</h3>
              <ul className="client-list">
                <li>Subscriptions or products purchased with voucher codes or significant discounts may be non-refundable</li>
                <li>This should be clearly stated at time of purchase</li>
                <li>Coaches may have stricter refund policies for promotional offers</li>
                <li>Always check refund terms before using discount codes</li>
              </ul>

              <h3 className="client-card__subsection-title">6.6 Fraudulent Activity</h3>
              <ul className="client-list">
                <li>Refunds will not be issued if fraud or misrepresentation is detected</li>
                <li>Uploading fake payment proofs, providing false information, or attempting to manipulate refund policies will result in refund denial and possible account suspension</li>
                <li>Legitimate payment disputes should be supported with proper documentation</li>
              </ul>

              <h3 className="client-card__subsection-title">6.7 Account Termination</h3>
              <ul className="client-list">
                <li>If your account is terminated for violating Terms of Service, you forfeit any right to refunds</li>
                <li>If you voluntarily close your account, existing refund policies still apply</li>
                <li>Active subscriptions are not automatically refunded upon account closure</li>
              </ul>
            </div>
          </div>

          {/* Section 7: Dispute Resolution */}
          <div className="client-card">
            <h2 className="client-card__section-title">7. Refund Disputes and Resolution</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">7.1 Direct Resolution Encouraged</h3>
              <ul className="client-list">
                <li>We strongly encourage resolving refund issues directly with your coach through open communication</li>
                <li>Most coaches want to maintain positive client relationships and will work toward fair solutions</li>
                <li>Approach disputes professionally and provide clear documentation</li>
              </ul>

              <h3 className="client-card__subsection-title">7.2 PulseLedger Mediation</h3>
              <p>If you cannot resolve a refund dispute with your coach after reasonable attempts, PulseLedger can assist:</p>
              <ul className="client-list">
                <li><strong>Contact:</strong> Email mail.pulseledger@gmail.com with subject "Refund Dispute Mediation"</li>
                <li><strong>Required Information:</strong>
                  <ul className="client-list">
                    <li>Your name and account details</li>
                    <li>Coach name and contact information</li>
                    <li>Subscription or order details</li>
                    <li>Payment proof and amount</li>
                    <li>Complete timeline of events and communications</li>
                    <li>Screenshots or records of all attempts to resolve with coach</li>
                    <li>Desired resolution</li>
                  </ul>
                </li>
                <li><strong>Process:</strong> We will review the case, contact your coach, and facilitate discussion</li>
                <li><strong>Timeline:</strong> Mediation process typically takes 10-15 business days</li>
              </ul>

              <h3 className="client-card__subsection-title">7.3 PulseLedger's Authority</h3>
              <ul className="client-list">
                <li>PulseLedger can mediate disputes but cannot force coaches to issue refunds</li>
                <li>We can provide guidance based on fair practices and this policy</li>
                <li>In cases of clear coach misconduct, we may suspend coach accounts</li>
                <li>Final refund decisions rest with the coach as the service provider</li>
              </ul>

              <h3 className="client-card__subsection-title">7.4 Coach Standards and Accountability</h3>
              <ul className="client-list">
                <li>Coaches who repeatedly deny reasonable refund requests or engage in unfair practices may face account review or suspension</li>
                <li>We monitor patterns of complaints and refund disputes</li>
                <li>Coaches are expected to maintain professional standards and fair business practices</li>
              </ul>

              <h3 className="client-card__subsection-title">7.5 Legal Recourse</h3>
              <ul className="client-list">
                <li>Refund disputes are primarily between you and your coach (as independent parties)</li>
                <li>If mediation fails, you may pursue legal remedies in accordance with applicable consumer protection laws</li>
                <li>Consult legal counsel for significant disputes</li>
              </ul>
            </div>
          </div>

          {/* Section 9: Consumer Rights */}
          <div className="client-card">
            <h2 className="client-card__section-title">9. Your Consumer Rights</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">8.1 Applicable Laws</h3>
              <ul className="client-list">
                <li>Your refund rights may be protected by consumer protection laws in your jurisdiction</li>
                <li>This Refund Policy does not limit any statutory rights you may have under applicable law</li>
                <li>In case of conflict between this policy and mandatory consumer protection laws, the law prevails</li>
              </ul>

              <h3 className="client-card__subsection-title">8.2 Right to Information</h3>
              <ul className="client-list">
                <li>You have the right to clear information about prices, services, and refund policies before making a purchase</li>
                <li>Coaches should disclose any non-refundable terms at the time of sale</li>
                <li>You can ask coaches about their specific refund policies before subscribing or purchasing</li>
              </ul>

              <h3 className="client-card__subsection-title">8.3 Right to Fair Treatment</h3>
              <ul className="client-list">
                <li>You have the right to be treated fairly and respectfully in all refund matters</li>
                <li>Coaches should not discriminate or retaliate against clients who request legitimate refunds</li>
                <li>You should receive timely responses to refund inquiries</li>
              </ul>

              <h3 className="client-card__subsection-title">8.4 Documentation Rights</h3>
              <ul className="client-list">
                <li>You have the right to receive and retain payment receipts, transaction confirmations, and refund confirmations</li>
                <li>Request written confirmation of refund approval and processing</li>
                <li>Keep copies of all payment proofs and communications</li>
              </ul>
            </div>
          </div>

          {/* Section 10: Best Practices */}
          <div className="client-card">
            <h2 className="client-card__section-title">10. Best Practices for Refund Requests</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">9.1 Before Purchasing</h3>
              <ul className="client-list">
                <li>Read and understand your coach's specific refund policy before subscribing or ordering</li>
                <li>Ask questions about refund terms if anything is unclear</li>
                <li>Verify subscription duration, pricing, and what's included</li>
                <li>Save screenshots of product descriptions, prices, and terms</li>
              </ul>

              <h3 className="client-card__subsection-title">9.2 During Service</h3>
              <ul className="client-list">
                <li>Communicate regularly with your coach about your progress and any concerns</li>
                <li>Address issues early rather than waiting until requesting a refund</li>
                <li>Document your experiences, especially if quality issues arise</li>
                <li>Keep all payment proofs and transaction confirmations</li>
              </ul>

              <h3 className="client-card__subsection-title">9.3 When Requesting Refunds</h3>
              <ul className="client-list">
                <li>Be prompt - request refunds as soon as you decide services aren't suitable</li>
                <li>Be clear and specific about your reasons</li>
                <li>Be professional and courteous in all communications</li>
                <li>Provide all requested documentation promptly</li>
                <li>Be realistic about what you can expect based on how much of the service you've used</li>
                <li>Understand that coaches have businesses to run and may have legitimate reasons for refund policies</li>
              </ul>

              <h3 className="client-card__subsection-title">9.4 After Refund</h3>
              <ul className="client-list">
                <li>Verify that refund was received in your account</li>
                <li>Keep refund confirmation for your records</li>
                <li>Provide feedback to help improve services (optional)</li>
              </ul>
            </div>
          </div>

          {/* Section 11: Changes to Policy */}
          <div className="client-card">
            <h2 className="client-card__section-title">11. Changes to This Refund Policy</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">10.1 Policy Updates</h3>
              <ul className="client-list">
                <li>We may update this Refund Policy from time to time to reflect changes in our practices or legal requirements</li>
                <li>Updates will be posted on this page with a new "Last Updated" date</li>
                <li>Material changes will be communicated via email or prominent notice on the platform</li>
              </ul>

              <h3 className="client-card__subsection-title">10.2 Continued Use</h3>
              <ul className="client-list">
                <li>Continued use of PulseLedger after policy changes constitutes acceptance of the updated policy</li>
                <li>Existing subscriptions and orders are generally governed by the policy in effect at the time of purchase</li>
              </ul>

              <h3 className="client-card__subsection-title">10.3 Review Regularly</h3>
              <ul className="client-list">
                <li>We encourage you to review this Refund Policy periodically</li>
                <li>Stay informed about your rights and obligations regarding refunds</li>
              </ul>
            </div>
          </div>

          {/* Section 12: Contact Information */}
          <div className="client-card">
            <h2 className="client-card__section-title">12. Contact Information</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">11.1 For Refund Requests</h3>
              <ul className="client-list">
                <li><strong>Primary Contact:</strong> Your assigned coach (contact through platform or coach's provided contact methods)</li>
                <li><strong>Coach Contact Info:</strong> Available in your account under "My Coach" or coach profile</li>
              </ul>

              <h3 className="client-card__subsection-title">11.2 For Refund Disputes or Platform Issues</h3>
              <ul className="client-list">
                <li><strong>Email:</strong> mail.pulseledger@gmail.com</li>
                <li><strong>Subject Line:</strong> "Refund Dispute" or "Refund Policy Inquiry"</li>
                <li><strong>Response Time:</strong> 5-10 business days for platform-related refund matters</li>
              </ul>

              <h3 className="client-card__subsection-title">11.3 For Policy Questions</h3>
              <ul className="client-list">
                <li><strong>Email:</strong> mail.pulseledger@gmail.com</li>
                <li><strong>Subject Line:</strong> "Refund Policy Question"</li>
                <li>We're happy to clarify any aspects of this policy</li>
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
              This Refund Policy is part of our Terms and Conditions and should be read in conjunction with our Privacy Policy.
            </p>
          </div>

          {/* Footer acknowledgment */}
          <div className="client-card">
            <div className="client-card__content">
              <p className="text-center">
                <strong>Important Reminder:</strong>
              </p>
              <p className="text-center">
                For all refund requests, please contact your assigned coach first. PulseLedger is here to support you if direct resolution is not possible.
              </p>
              <p className="text-center">
                Thank you for using PulseLedger!
              </p>
            </div>
          </div>
        </section>
    </main>
  );
}
