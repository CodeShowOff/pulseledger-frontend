export default function AboutPage() {
  return (
    <main className="client-page footer-page">
      <header className="client-page__header">
        <h1 className="client-page__title">About PulseLedger</h1>
      </header>

      <section className="client-page__sections">
          {/* Section 1: Our Story */}
          <div className="client-card">
            <h2 className="client-card__section-title">Our Story</h2>
            <div className="client-card__content">
              <p>
                PulseLedger was born from a simple yet powerful vision: to bridge the gap between dedicated health and fitness coaches and clients seeking transformative wellness journeys. We recognized that while the world is full of talented fitness professionals and motivated individuals, the tools to connect them effectively were often fragmented, inefficient, or simply missing.
              </p>
              <p className="mt-4">
                In today's digital age, health and wellness coaching deserves a platform that's as dynamic and personalized as the services coaches provide. PulseLedger emerged as the answer—a comprehensive platform designed to streamline the coach-client relationship, making professional guidance more accessible, progress more transparent, and health goals more achievable.
              </p>
              <p className="mt-4">
                What started as a vision has evolved into a thriving ecosystem where certified coaches can showcase their expertise, manage their practice efficiently, and deliver exceptional value to their clients, all while clients receive personalized attention, track their progress meaningfully, and stay motivated on their wellness journey.
              </p>
            </div>
          </div>

          {/* Section 2: Our Mission */}
          <div className="client-card">
            <h2 className="client-card__section-title">Our Mission</h2>
            <div className="client-card__content">
              <p className="mb-4">
                <strong>To democratize access to quality health and fitness coaching by creating a technology platform that empowers coaches to scale their impact and enables clients to achieve sustainable wellness transformations.</strong>
              </p>
              <p>
                We believe that everyone deserves access to professional health guidance, and every qualified coach deserves tools that amplify their ability to serve. PulseLedger exists to make this belief a reality by:
              </p>
              <ul className="client-list">
                <li><strong>Empowering Coaches:</strong> Providing professional-grade tools to manage clients, create customized plans, track progress, and grow their coaching practice</li>
                <li><strong>Supporting Clients:</strong> Offering intuitive interfaces to connect with coaches, follow personalized plans, monitor progress, and stay accountable to health goals</li>
                <li><strong>Building Community:</strong> Fostering meaningful coach-client relationships built on trust, transparency, and measurable results</li>
                <li><strong>Leveraging Technology:</strong> Using modern, secure technology to eliminate administrative burdens and focus energy where it matters most—transformation</li>
                <li><strong>Maintaining Standards:</strong> Upholding the highest standards of data security, privacy, and professional conduct</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Our Vision */}
          <div className="client-card">
            <h2 className="client-card__section-title">Our Vision</h2>
            <div className="client-card__content">
              <p>
                To become the leading platform connecting health and fitness professionals with clients worldwide, recognized for innovation, integrity, and impact in the wellness technology space. We envision a future where:
              </p>
              <ul className="client-list">
                <li>Every individual has access to affordable, personalized health coaching</li>
                <li>Qualified coaches can build thriving practices without technical barriers</li>
                <li>Health transformations are data-driven, trackable, and sustainable</li>
                <li>The wellness industry operates with transparency and accountability</li>
                <li>Technology serves human connection rather than replacing it</li>
              </ul>
            </div>
          </div>

          {/* Section 4: What We Do */}
          <div className="client-card">
            <h2 className="client-card__section-title">What We Do</h2>
            <div className="client-card__content">
              <p className="mb-4">
                PulseLedger is a comprehensive health and fitness coaching platform that connects certified coaches with clients seeking personalized wellness guidance. We facilitate every aspect of the coach-client relationship through innovative technology:
              </p>

              <h3 className="client-card__subsection-title">For Coaches</h3>
              <ul className="client-list">
                <li><strong>Client Management:</strong> Centralized dashboard to view and manage all clients, track their progress, and monitor engagement</li>
                <li><strong>Workout Plan Creation:</strong> Build customized workout routines with exercise selection, sets, reps, rest times, and weekly schedules</li>
                <li><strong>Diet Plan Creation:</strong> Design personalized nutrition plans with meal schedules, macronutrient targets, and food recommendations</li>
                <li><strong>Plan Templates:</strong> Create reusable templates for both workout and diet plans to streamline your coaching process</li>
                <li><strong>Plan Customization:</strong> Tailor templates to individual client needs with specific goals, tasks, and timelines (1-52 weeks)</li>
                <li><strong>Progress Monitoring:</strong> Access client health metrics (weight, height, BMI, water intake), progress photos, and log history in real-time</li>
                <li><strong>Subscription Management:</strong> Handle plan subscriptions, approve requests, and manage billing through integrated payment solutions</li>
                <li><strong>Product Marketplace:</strong> List and sell health products, supplements, or fitness equipment directly to clients</li>
                <li><strong>Professional Profile:</strong> Showcase credentials, specializations, experience, certifications, awards, and transformation results</li>
                <li><strong>Analytics Dashboard:</strong> View client statistics, progress trends, subscription metrics, and business insights</li>
                <li><strong>Communication Tools:</strong> Send notifications, updates, and maintain communication with your client base</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">For Clients</h3>
              <ul className="client-list">
                <li><strong>Coach Discovery:</strong> Find and connect with certified coaches through referral codes and public coach profiles</li>
                <li><strong>Personalized Workout Plans:</strong> Access custom workout routines designed specifically for your fitness level, goals, and preferences</li>
                <li><strong>Personalized Diet Plans:</strong> Follow nutrition plans tailored to your dietary needs, health goals, and lifestyle requirements</li>
                <li><strong>Exercise Tracking:</strong> View detailed workout schedules with exercises, sets, reps, rest periods, and technique instructions</li>
                <li><strong>Meal Planning:</strong> Access structured meal schedules with recipes, portion sizes, and nutritional information</li>
                <li><strong>Progress Tracking:</strong> Log daily health metrics including weight, height, BMI, water intake, and personal notes</li>
                <li><strong>Photo Documentation:</strong> Upload progress photos to visually track your transformation journey</li>
                <li><strong>Subscription Flexibility:</strong> Choose from various plan durations (4-52 weeks) and manage subscriptions with transparency</li>
                <li><strong>Product Access:</strong> Purchase recommended products directly from your coach through the integrated marketplace</li>
                <li><strong>Dashboard Insights:</strong> View your progress trends, upcoming tasks, and achievement milestones</li>
                <li><strong>Secure Platform:</strong> Rest assured knowing your health data is protected with industry-standard security</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">Platform Features</h3>
              <ul className="client-list">
                <li><strong>Secure Authentication:</strong> JWT-based authentication with 15-minute access tokens and 7-day refresh tokens</li>
                <li><strong>Role-Based Access:</strong> Distinct experiences for clients, coaches, and administrators with appropriate permissions</li>
                <li><strong>Cloud Storage:</strong> Reliable image hosting via Cloudinary for avatars, progress photos, and coach portfolios</li>
                <li><strong>Payment Flexibility:</strong> Support for manual payments via UPI QR codes, cash, and other methods</li>
                <li><strong>Notification System:</strong> In-app notifications for orders, subscriptions, plans, and system updates</li>
                <li><strong>Voucher System:</strong> Discount codes and promotional offers managed by coaches</li>
                <li><strong>Order Management:</strong> Complete order tracking from placement to fulfillment and completion</li>
                <li><strong>Data Analytics:</strong> Comprehensive dashboards for coaches to understand client trends and business performance</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Our Values */}
          <div className="client-card">
            <h2 className="client-card__section-title">Our Core Values</h2>
            <div className="client-card__content">
              <div className="mb-4">
                <h3 className="client-card__subsection-title">🎯 Client-Centricity</h3>
                <p>Every decision we make starts with one question: "How does this serve our users?" Whether you're a coach building your practice or a client pursuing wellness goals, your success is our success.</p>
              </div>

              <div className="mb-4">
                <h3 className="client-card__subsection-title">🔒 Privacy & Security</h3>
                <p>Health data is deeply personal. We implement industry-leading security measures including encryption, secure authentication, and strict access controls. Your data is yours, and protecting it is our top priority.</p>
              </div>

              <div className="mb-4">
                <h3 className="client-card__subsection-title">🤝 Transparency</h3>
                <p>We believe in honest communication, clear policies, and transparent practices. From pricing to data usage to platform operations, we're committed to openness with our community.</p>
              </div>

              <div className="mb-4">
                <h3 className="client-card__subsection-title">💡 Innovation</h3>
                <p>The wellness industry evolves rapidly, and so do we. We continuously improve our platform with new features, better user experiences, and cutting-edge technology to serve you better.</p>
              </div>

              <div className="mb-4">
                <h3 className="client-card__subsection-title">🌟 Excellence</h3>
                <p>We set high standards for ourselves and our platform. Quality code, thoughtful design, responsive support, and reliable performance—excellence isn't optional, it's essential.</p>
              </div>

              <div className="mb-4">
                <h3 className="client-card__subsection-title">🌍 Accessibility</h3>
                <p>Quality health coaching shouldn't be a luxury. We strive to make our platform accessible, affordable, and user-friendly for coaches and clients of all backgrounds and technical abilities.</p>
              </div>

              <div className="mb-4">
                <h3 className="client-card__subsection-title">⚖️ Integrity</h3>
                <p>We operate with honesty and fairness. We don't sell user data, we don't make false promises, and we hold ourselves accountable to the highest ethical standards.</p>
              </div>
            </div>
          </div>

          {/* Section 6: Why Choose PulseLedger */}
          <div className="client-card">
            <h2 className="client-card__section-title">Why Choose PulseLedger?</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">For Coaches</h3>
              <ul className="client-list">
                <li><strong>All-in-One Solution:</strong> Manage clients, workout plans, diet plans, subscriptions, products, and payments from a single platform</li>
                <li><strong>Comprehensive Plan Builder:</strong> Create detailed workout routines and nutrition plans with built-in templates and customization options</li>
                <li><strong>Professional Image:</strong> Showcase your credentials, results, and expertise with a comprehensive public profile</li>
                <li><strong>Time Savings:</strong> Automate administrative tasks and focus on what you do best—coaching</li>
                <li><strong>Client Insights:</strong> Access detailed progress data and analytics to provide better, data-driven coaching</li>
                <li><strong>Business Growth:</strong> Use built-in tools for subscriptions, products, and client management to scale your practice</li>
                <li><strong>Flexibility:</strong> Set your own prices, create your own plans, and manage your practice your way</li>
                <li><strong>Technical Support:</strong> We handle the technology so you can focus on transformations</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">For Clients</h3>
              <ul className="client-list">
                <li><strong>Personalized Approach:</strong> Work with dedicated coaches who create customized workout and diet plans specifically for you</li>
                <li><strong>Structured Guidance:</strong> Follow detailed workout routines and meal plans designed to help you reach your specific goals</li>
                <li><strong>Clear Progress Tracking:</strong> See your transformation with visual metrics, charts, and photo documentation</li>
                <li><strong>Accountability:</strong> Daily logging and coach oversight keep you motivated and on track</li>
                <li><strong>Convenience:</strong> Access your workout plans, diet schedules, and track progress anytime, anywhere</li>
                <li><strong>Transparency:</strong> Clear pricing, visible progress, and open communication with your coach</li>
                <li><strong>Support:</strong> Dedicated coaching support throughout your wellness journey</li>
                <li><strong>Results-Oriented:</strong> Plans designed with specific, measurable goals and outcomes</li>
              </ul>
            </div>
          </div>

          {/* Section 7: Our Technology */}
          <div className="client-card">
            <h2 className="client-card__section-title">Our Technology</h2>
            <div className="client-card__content">
              <p className="mb-4">
                PulseLedger is built on modern, reliable, and secure technology infrastructure designed for performance, scalability, and user experience:
              </p>

              <h3 className="client-card__subsection-title">Platform Architecture</h3>
              <ul className="client-list">
                <li><strong>Frontend:</strong> Built with Next.js 16 and React 18 for fast, responsive user interfaces</li>
                <li><strong>Backend:</strong> Node.js (v20+) with Express 5 for robust, scalable API services</li>
                <li><strong>Database:</strong> MongoDB with Mongoose for flexible, high-performance data management</li>
                <li><strong>Cloud Storage:</strong> Cloudinary for optimized, secure image storage and delivery</li>
                <li><strong>Authentication:</strong> JWT (JSON Web Tokens) with secure token rotation and management</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">Security Measures</h3>
              <ul className="client-list">
                <li><strong>Encryption:</strong> TLS/SSL encryption for all data transmission (HTTPS)</li>
                <li><strong>Password Security:</strong> Bcrypt hashing with configurable salt rounds (10-16)</li>
                <li><strong>Input Validation:</strong> Joi schema validation for all user inputs</li>
                <li><strong>Sanitization:</strong> Protection against XSS and NoSQL injection attacks</li>
                <li><strong>Rate Limiting:</strong> Protection against brute-force attacks and abuse (100 req/15min general, 50 req/10min auth)</li>
                <li><strong>Secure Cookies:</strong> HTTP-only cookies with appropriate SameSite policies</li>
                <li><strong>Security Headers:</strong> Helmet.js implementation with CSP, CORS, and other protective headers</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">Performance & Reliability</h3>
              <ul className="client-list">
                <li><strong>Optimized Queries:</strong> Indexed database queries for fast data retrieval</li>
                <li><strong>CDN Delivery:</strong> Global content delivery for fast image loading</li>
                <li><strong>Error Handling:</strong> Comprehensive error handling and logging for reliability</li>
                <li><strong>Scalability:</strong> Architecture designed to grow with increasing user base</li>
              </ul>
            </div>
          </div>

          {/* Section 8: Our Commitment */}
          <div className="client-card">
            <h2 className="client-card__section-title">Our Commitment to You</h2>
            <div className="client-card__content">
              <h3 className="client-card__subsection-title">Continuous Improvement</h3>
              <ul className="client-list">
                <li>Regular platform updates with new features and enhancements</li>
                <li>Responsive to user feedback and feature requests</li>
                <li>Ongoing security updates and performance optimizations</li>
                <li>Staying current with industry best practices and technologies</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">User Support</h3>
              <ul className="client-list">
                <li>Responsive customer support via email (mail.pulseledger@gmail.com)</li>
                <li>Comprehensive documentation and help resources</li>
                <li>Active resolution of technical issues and user concerns</li>
                <li>Mediation support for coach-client disputes when needed</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">Ethical Operations</h3>
              <ul className="client-list">
                <li>We never sell or share your personal data with third parties for marketing</li>
                <li>We maintain transparent pricing and policies</li>
                <li>We enforce professional standards and conduct among coaches</li>
                <li>We comply with applicable data protection and consumer laws</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">Platform Stability</h3>
              <ul className="client-list">
                <li>Reliable uptime and availability for uninterrupted service</li>
                <li>Regular backups to protect your data</li>
                <li>Disaster recovery procedures for business continuity</li>
                <li>Transparent communication about any service issues or changes</li>
              </ul>
            </div>
          </div>

          {/* Section 9: Our Team Approach */}
          <div className="client-card">
            <h2 className="client-card__section-title">Our Team & Approach</h2>
            <div className="client-card__content">
              <p className="mb-4">
                PulseLedger is developed and maintained by a dedicated team of developers, designers, and health technology enthusiasts who are passionate about making wellness coaching more effective and accessible.
              </p>

              <h3 className="client-card__subsection-title">Development Philosophy</h3>
              <ul className="client-list">
                <li><strong>User-First Design:</strong> Every feature is designed with real user needs and workflows in mind</li>
                <li><strong>Agile Development:</strong> Iterative improvements based on feedback and evolving requirements</li>
                <li><strong>Quality Code:</strong> Clean, maintainable, well-documented code following industry best practices</li>
                <li><strong>Security-First:</strong> Security considerations integrated into every development decision</li>
                <li><strong>Performance Focus:</strong> Optimized for speed, efficiency, and reliability</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">Community Engagement</h3>
              <ul className="client-list">
                <li>Regular communication with coaches and clients for feedback</li>
                <li>Feature requests considered and prioritized based on community needs</li>
                <li>Transparent roadmap and development priorities</li>
                <li>Active participation in wellness technology discussions</li>
              </ul>
            </div>
          </div>

          {/* Section 10: Join the PulseLedger Community */}
          <div className="client-card">
            <h2 className="client-card__section-title">Join the PulseLedger Community</h2>
            <div className="client-card__content">
              <p className="mb-4">
                Whether you're a certified coach looking to grow your practice or someone seeking professional health guidance, PulseLedger is here to support your journey.
              </p>

              <h3 className="client-card__subsection-title">For Coaches</h3>
              <p>
                Ready to take your coaching practice to the next level? Join PulseLedger and gain access to professional tools that help you manage clients efficiently, deliver exceptional value, and scale your impact. Register as a coach today and start building your profile.
              </p>

              <h3 className="client-card__subsection-title mt-4">For Clients</h3>
              <p>
                Looking for personalized health and fitness guidance? Connect with certified coaches on PulseLedger who can create customized plans, track your progress, and support you every step of the way. Get a coach referral code and begin your transformation journey.
              </p>

              <h3 className="client-card__subsection-title mt-4">Get Started Today</h3>
              <ul className="client-list">
                <li><strong>Explore:</strong> Browse public coach profiles to find a coaching style that fits you</li>
                <li><strong>Register:</strong> Create your account with a coach referral code (clients) or as an independent coach</li>
                <li><strong>Connect:</strong> Start working together toward your health and wellness goals</li>
                <li><strong>Transform:</strong> Track progress, stay accountable, and achieve lasting results</li>
              </ul>
            </div>
          </div>

          {/* Section 11: Contact & Connect */}
          <div className="client-card">
            <h2 className="client-card__section-title">Contact & Connect</h2>
            <div className="client-card__content">
              <p className="mb-4">
                We'd love to hear from you! Whether you have questions, feedback, partnership inquiries, or just want to say hello, we're here to help.
              </p>

              <h3 className="client-card__subsection-title">Get in Touch</h3>
              <ul className="client-list">
                <li><strong>General Inquiries:</strong> mail.pulseledger@gmail.com</li>
                <li><strong>Technical Support:</strong> mail.pulseledger@gmail.com (Subject: "Technical Support")</li>
                <li><strong>Coach Partnerships:</strong> mail.pulseledger@gmail.com (Subject: "Coach Partnership")</li>
                <li><strong>Business Inquiries:</strong> mail.pulseledger@gmail.com (Subject: "Business Inquiry")</li>
                <li><strong>Media & Press:</strong> mail.pulseledger@gmail.com (Subject: "Media Inquiry")</li>
              </ul>

              <h3 className="client-card__subsection-title mt-4">Response Time</h3>
              <ul className="client-list">
                <li>General inquiries: 5-7 business days</li>
                <li>Technical support: 3-5 business days</li>
                <li>Urgent issues: 24-48 hours</li>
              </ul>

              <p className="mt-4">
                <strong>Business Name:</strong> PulseLedger<br />
                <strong>Platform:</strong> Health & Fitness Coaching Technology<br />
                <strong>Founded:</strong> 2025<br />
                <strong>Headquarters:</strong> Digital Platform (Cloud-Based)
              </p>
            </div>
          </div>

          {/* Footer Section */}
          <div className="client-card">
            <div className="client-card__content">
              <p className="text-center">
                <strong>Thank you for being part of the PulseLedger community!</strong>
              </p>
              <p className="text-center mt-2">
                Together, we're making health transformation accessible, measurable, and sustainable.
              </p>
              <p className="text-center mt-4">
                <em>"Empowering wellness, one connection at a time."</em>
              </p>
            </div>
          </div>
        </section>
    </main>
  );
}
