import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-customer-service',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="customer-service-container">
      <div class="container">
        <!-- Header Section -->
        <div class="header-section">
          <h1 class="page-title">
            <mat-icon>support_agent</mat-icon>
            Customer Service
          </h1>
          <p class="page-subtitle">
            We're here to help! Find answers to your questions and get the support you need.
          </p>
        </div>

        <!-- Navigation Menu -->
        <div class="navigation-menu">
          <a href="#help-center" class="nav-item" [class.active]="activeSection === 'help-center'">
            <mat-icon>help</mat-icon>
            Help Center
          </a>
          <a href="#shipping-info" class="nav-item" [class.active]="activeSection === 'shipping-info'">
            <mat-icon>local_shipping</mat-icon>
            Shipping Info
          </a>
          <a href="#returns" class="nav-item" [class.active]="activeSection === 'returns'">
            <mat-icon>undo</mat-icon>
            Returns
          </a>
          <a href="#privacy-policy" class="nav-item" [class.active]="activeSection === 'privacy-policy'">
            <mat-icon>privacy_tip</mat-icon>
            Privacy Policy
          </a>
          <a href="#terms-of-service" class="nav-item" [class.active]="activeSection === 'terms-of-service'">
            <mat-icon>description</mat-icon>
            Terms of Service
          </a>
        </div>

        <!-- Help Center Section -->
        <section id="help-center" class="content-section">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>help</mat-icon>
                Help Center
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="faq-section">
                <h3>Frequently Asked Questions</h3>
                
                <mat-expansion-panel class="faq-item">
                  <mat-expansion-panel-header>
                    <mat-panel-title>How do I place an order?</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p>Placing an order is simple! Browse our laptop collection, select your desired model, choose your specifications, and click "Add to Cart". Once you're ready, proceed to checkout, enter your shipping information, and complete your payment. You'll receive an order confirmation email with tracking details.</p>
                </mat-expansion-panel>

                <mat-expansion-panel class="faq-item">
                  <mat-expansion-panel-header>
                    <mat-panel-title>What payment methods do you accept?</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p>We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely through encrypted channels to protect your financial information.</p>
                </mat-expansion-panel>

                <mat-expansion-panel class="faq-item">
                  <mat-expansion-panel-header>
                    <mat-panel-title>How can I track my order?</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p>Once your order ships, you'll receive a tracking number via email. You can track your package in real-time using our tracking system or directly through the carrier's website. You can also log into your account to view order status and tracking information.</p>
                </mat-expansion-panel>

                <mat-expansion-panel class="faq-item">
                  <mat-expansion-panel-header>
                    <mat-panel-title>Do you offer technical support?</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p>Yes! We provide comprehensive technical support for all laptops purchased from us. Our support team can help with setup, software installation, troubleshooting, and general usage questions. Support is available via phone, email, and live chat during business hours.</p>
                </mat-expansion-panel>

                <mat-expansion-panel class="faq-item">
                  <mat-expansion-panel-header>
                    <mat-panel-title>What if my laptop arrives damaged?</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p>If your laptop arrives damaged, please contact us immediately within 48 hours of delivery. We'll arrange for a replacement or full refund. Take photos of the damage and keep all packaging materials. Our customer service team will guide you through the process.</p>
                </mat-expansion-panel>
              </div>

              <div class="contact-support">
                <h3>Still Need Help?</h3>
                <p>Our customer support team is available to assist you with any questions or concerns.</p>
                <div class="support-options">
                  <button mat-raised-button color="primary" routerLink="/contact">
                    <mat-icon>contact_mail</mat-icon>
                    Contact Support
                  </button>
                  <button mat-button>
                    <mat-icon>phone</mat-icon>
                    Call Us: +1 (555) 123-4567
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <!-- Shipping Info Section -->
        <section id="shipping-info" class="content-section">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>local_shipping</mat-icon>
                Shipping Information
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="shipping-overview">
                <h3>Free Shipping on All Orders!</h3>
                <p>We're proud to offer free standard shipping on all laptop orders within the continental United States. No minimum order required!</p>
              </div>

              <div class="shipping-options">
                <h3>Shipping Options</h3>
                <div class="shipping-grid">
                  <div class="shipping-option">
                    <mat-icon>local_shipping</mat-icon>
                    <h4>Standard Shipping</h4>
                    <p><strong>FREE</strong> - 5-7 business days</p>
                    <p>Standard ground shipping with tracking included</p>
                  </div>
                  <div class="shipping-option">
                    <mat-icon>fast_forward</mat-icon>
                    <h4>Express Shipping</h4>
                    <p><strong>$19.99</strong> - 2-3 business days</p>
                    <p>Priority shipping with signature confirmation</p>
                  </div>
                  <div class="shipping-option">
                    <mat-icon>flash_on</mat-icon>
                    <h4>Overnight Shipping</h4>
                    <p><strong>$39.99</strong> - Next business day</p>
                    <p>Guaranteed next-day delivery by 10:30 AM</p>
                  </div>
                </div>
              </div>

              <div class="shipping-details">
                <h3>Shipping Details</h3>
                <div class="details-grid">
                  <div class="detail-item">
                    <mat-icon>schedule</mat-icon>
                    <div>
                      <h4>Processing Time</h4>
                      <p>Orders are processed within 1-2 business days. Custom configurations may take 3-5 business days.</p>
                    </div>
                  </div>
                  <div class="detail-item">
                    <mat-icon>location_on</mat-icon>
                    <div>
                      <h4>Delivery Areas</h4>
                      <p>We ship to all 50 US states, Washington DC, and Puerto Rico. International shipping available upon request.</p>
                    </div>
                  </div>
                  <div class="detail-item">
                    <mat-icon>security</mat-icon>
                    <div>
                      <h4>Secure Packaging</h4>
                      <p>All laptops are packaged in protective materials and shipped in sturdy boxes to ensure safe delivery.</p>
                    </div>
                  </div>
                  <div class="detail-item">
                    <mat-icon>track_changes</mat-icon>
                    <div>
                      <h4>Tracking</h4>
                      <p>You'll receive tracking information via email once your order ships. Track your package in real-time.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="shipping-restrictions">
                <h3>Shipping Restrictions</h3>
                <ul>
                  <li>Signature required for all laptop deliveries</li>
                  <li>Adult signature required for orders over $1,000</li>
                  <li>No P.O. Box deliveries for laptops</li>
                  <li>International shipping subject to customs and import fees</li>
                </ul>
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <!-- Returns Section -->
        <section id="returns" class="content-section">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>undo</mat-icon>
                Returns & Exchanges
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="returns-overview">
                <h3>30-Day Return Policy</h3>
                <p>We want you to be completely satisfied with your laptop purchase. That's why we offer a comprehensive 30-day return policy with no restocking fees.</p>
              </div>

              <div class="return-conditions">
                <h3>Return Conditions</h3>
                <div class="conditions-grid">
                  <div class="condition-item">
                    <mat-icon class="check">check_circle</mat-icon>
                    <div>
                      <h4>Like New Condition</h4>
                      <p>Laptop must be in original condition with no damage, scratches, or signs of use</p>
                    </div>
                  </div>
                  <div class="condition-item">
                    <mat-icon class="check">check_circle</mat-icon>
                    <div>
                      <h4>Original Packaging</h4>
                      <p>All original packaging, accessories, cables, and documentation must be included</p>
                    </div>
                  </div>
                  <div class="condition-item">
                    <mat-icon class="check">check_circle</mat-icon>
                    <div>
                      <h4>Factory Reset</h4>
                      <p>Laptop must be factory reset with all personal data removed</p>
                    </div>
                  </div>
                  <div class="condition-item">
                    <mat-icon class="check">check_circle</mat-icon>
                    <div>
                      <h4>Within 30 Days</h4>
                      <p>Return request must be initiated within 30 days of delivery</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="return-process">
                <h3>How to Return</h3>
                <div class="process-steps">
                  <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h4>Contact Customer Service</h4>
                      <p>Call us at +1 (555) 123-4567 or email returns&#64;laptopshop.com to initiate your return</p>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h4>Receive Return Label</h4>
                      <p>We'll email you a prepaid return shipping label within 24 hours</p>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <h4>Package & Ship</h4>
                      <p>Package your laptop securely and drop it off at any authorized shipping location</p>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                      <h4>Receive Refund</h4>
                      <p>Once we receive and inspect your return, we'll process your refund within 3-5 business days</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="exchange-policy">
                <h3>Exchange Policy</h3>
                <p>Need a different model or configuration? We offer hassle-free exchanges within 30 days of purchase. Simply contact our customer service team, and we'll help you find the perfect laptop for your needs.</p>
                <ul>
                  <li>Free return shipping for exchanges</li>
                  <li>Price difference adjustments for upgrades</li>
                  <li>Same-day processing for in-stock items</li>
                  <li>Extended warranty transfers available</li>
                </ul>
              </div>

              <div class="warranty-info">
                <h3>Warranty Information</h3>
                <p>All laptops come with manufacturer warranty coverage. Extended warranty options are available at checkout. Warranty terms vary by manufacturer but typically include:</p>
                <ul>
                  <li>1-3 years hardware coverage</li>
                  <li>Technical support included</li>
                  <li>Repair or replacement service</li>
                  <li>Accidental damage protection (optional)</li>
                </ul>
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <!-- Privacy Policy Section -->
        <section id="privacy-policy" class="content-section">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>privacy_tip</mat-icon>
                Privacy Policy
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="privacy-intro">
                <p><strong>Last Updated:</strong> January 1, 2025</p>
                <p>At Laptop Shop, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.</p>
              </div>

              <div class="privacy-section">
                <h3>Information We Collect</h3>
                <h4>Personal Information</h4>
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul>
                  <li>Create an account or make a purchase</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Contact customer service</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p>This information may include your name, email address, phone number, shipping address, billing address, and payment information.</p>

                <h4>Automatically Collected Information</h4>
                <p>We automatically collect certain information when you visit our website:</p>
                <ul>
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on site</li>
                  <li>Referring website information</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div class="privacy-section">
                <h3>How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Process and fulfill your orders</li>
                  <li>Provide customer service and support</li>
                  <li>Send order confirmations and shipping updates</li>
                  <li>Improve our website and services</li>
                  <li>Send marketing communications (with your consent)</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div class="privacy-section">
                <h3>Information Sharing</h3>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                <ul>
                  <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our website and conducting business</li>
                  <li><strong>Shipping Partners:</strong> With shipping companies to deliver your orders</li>
                  <li><strong>Payment Processors:</strong> With secure payment processors to handle transactions</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                </ul>
              </div>

              <div class="privacy-section">
                <h3>Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
                <ul>
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information</li>
                  <li>Employee training on data protection</li>
                </ul>
              </div>

              <div class="privacy-section">
                <h3>Your Rights</h3>
                <p>You have the right to:</p>
                <ul>
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data</li>
                  <li>File a complaint with relevant authorities</li>
                </ul>
                <p>To exercise these rights, please contact us at privacy&#64;laptopshop.com</p>
              </div>

              <div class="privacy-section">
                <h3>Cookies and Tracking</h3>
                <p>We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookie settings through your browser preferences.</p>
              </div>

              <div class="privacy-section">
                <h3>Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul>
                  <li>Email: privacy&#64;laptopshop.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Commerce Street, Business City, BC 12345</li>
                </ul>
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <!-- Terms of Service Section -->
        <section id="terms-of-service" class="content-section">
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>description</mat-icon>
                Terms of Service
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="terms-intro">
                <p><strong>Last Updated:</strong> January 1, 2025</p>
                <p>Welcome to Laptop Shop! These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms.</p>
              </div>

              <div class="terms-section">
                <h3>Acceptance of Terms</h3>
                <p>By accessing, browsing, or using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our website.</p>
              </div>

              <div class="terms-section">
                <h3>Use of Website</h3>
                <h4>Permitted Use</h4>
                <p>You may use our website for lawful purposes only. You agree to:</p>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect the intellectual property rights of others</li>
                </ul>

                <h4>Prohibited Use</h4>
                <p>You may not:</p>
                <ul>
                  <li>Use the website for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the website</li>
                  <li>Transmit viruses, malware, or other harmful code</li>
                  <li>Engage in fraudulent or deceptive practices</li>
                </ul>
              </div>

              <div class="terms-section">
                <h3>Product Information</h3>
                <p>We strive to provide accurate product descriptions, specifications, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, or error-free. Product images are for illustrative purposes and may not reflect the exact appearance of the product.</p>
                <p>We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.</p>
              </div>

              <div class="terms-section">
                <h3>Pricing and Payment</h3>
                <p>All prices are subject to change without notice. Prices do not include applicable taxes, shipping, or handling fees unless otherwise stated. Payment must be received before order processing begins.</p>
                <p>We accept various payment methods including credit cards, PayPal, and other secure payment options. By providing payment information, you represent that you are authorized to use the payment method.</p>
              </div>

              <div class="terms-section">
                <h3>Orders and Fulfillment</h3>
                <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including but not limited to:</p>
                <ul>
                  <li>Product unavailability</li>
                  <li>Pricing errors</li>
                  <li>Suspected fraudulent activity</li>
                  <li>Violation of these Terms</li>
                </ul>
                <p>We will notify you if your order is cancelled and provide a full refund if payment has been processed.</p>
              </div>

              <div class="terms-section">
                <h3>Warranties and Disclaimers</h3>
                <p>Products sold through our website come with manufacturer warranties as specified in the product documentation. We disclaim all other warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
                <p>Our website and services are provided "as is" without warranties of any kind. We do not warrant that our website will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
              </div>

              <div class="terms-section">
                <h3>Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, Laptop Shop shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use of our website or services.</p>
                <p>Our total liability to you for any claims arising from these Terms or your use of our website shall not exceed the amount you paid for the products or services in question.</p>
              </div>

              <div class="terms-section">
                <h3>Intellectual Property</h3>
                <p>All content on our website, including text, graphics, logos, images, and software, is the property of Laptop Shop or its licensors and is protected by copyright, trademark, and other intellectual property laws.</p>
                <p>You may not reproduce, distribute, modify, or create derivative works from our content without our express written permission.</p>
              </div>

              <div class="terms-section">
                <h3>Termination</h3>
                <p>We may terminate or suspend your access to our website immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the website will cease immediately.</p>
              </div>

              <div class="terms-section">
                <h3>Governing Law</h3>
                <p>These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved in the courts of California.</p>
              </div>

              <div class="terms-section">
                <h3>Changes to Terms</h3>
                <p>We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on our website. Your continued use of our website after such changes constitutes acceptance of the new Terms.</p>
              </div>

              <div class="terms-section">
                <h3>Contact Information</h3>
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <ul>
                  <li>Email: legal&#64;laptopshop.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Commerce Street, Business City, BC 12345</li>
                </ul>
              </div>
            </mat-card-content>
          </mat-card>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./customer-service.component.scss']
})
export class CustomerServiceComponent implements OnInit {
  activeSection: string = 'help-center';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Handle fragment navigation
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.activeSection = fragment;
        this.scrollToSection(fragment);
      }
    });
  }

  private scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}