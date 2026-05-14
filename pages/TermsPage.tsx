import React from 'react';

const Section: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
      {number}. {title}
    </h2>
    <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
      {children}
    </div>
  </div>
);

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-900 dark:text-white">Terms and Conditions</h1>
        <p className="text-sm text-center text-gray-400 mb-10">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <Section number="1" title="Agreement to Terms">
          <p>
            Welcome to Prompter. These Terms and Conditions govern your use of our website, platform, and services. By creating an account or using any part of the service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use the service.
          </p>
        </Section>

        <Section number="2" title="User Accounts">
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Account creation.</strong> To access the prompt generator, community features, and marketplace, you must create an account. You may sign up using an email address and password, or via Google OAuth. You agree to provide accurate information and to keep it up to date.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Account security.</strong> You are responsible for keeping your login credentials confidential and for all activity that occurs under your account. Notify us immediately if you suspect unauthorised use.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Age requirement.</strong> You must be at least 14 years old to use the service.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Account termination.</strong> We reserve the right to suspend or terminate accounts that violate these Terms, without prior notice. You may delete your own account at any time through your profile settings.
          </p>
        </Section>

        <Section number="3" title="User-Generated Content">
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Ownership.</strong> You retain ownership of the content you create, including prompts, collections, descriptions, comments, and feedback.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Licence to us.</strong> By submitting content to the service, you grant Prompter a non-exclusive, worldwide, royalty-free licence to use, display, and distribute that content solely for the purpose of operating and providing the service.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">AI-assisted content.</strong> Prompts generated through our AI tools are created with the assistance of third-party AI models. You are responsible for reviewing and verifying any AI-generated output before use, and for ensuring that your use of it complies with applicable law and does not infringe on the rights of others.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Moderation.</strong> All content submitted to public areas of the service is subject to review. We reserve the right to approve, reject, or remove any content at our discretion.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Your responsibility.</strong> You are solely responsible for your content. You represent that you own it or have the necessary rights to share it, and that it does not infringe on any third-party intellectual property, privacy, or other rights.
          </p>
        </Section>

        <Section number="4" title="Subscriptions and Payments">
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Free and Pro tiers.</strong> The service is available on a free tier with limited monthly generations and daily submissions. A paid Pro tier is available with expanded limits. Tier details are described on the Upgrade page and may change.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Billing.</strong> Pro subscriptions are billed on a recurring monthly basis. Your subscription renews automatically unless cancelled before the renewal date. We use third-party payment processors and do not store your payment card details.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Cancellation.</strong> You may cancel your Pro subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. No refunds are provided for unused portions of a billing cycle.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Marketplace purchases.</strong> Prompt collection purchases are final and non-refundable, except as required by applicable law.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Promotional codes.</strong> Promo codes may be offered at our discretion and are subject to usage limits and expiry dates. They are not redeemable for cash and may be withdrawn at any time.
          </p>
        </Section>

        <Section number="5" title="Prohibited Conduct">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Submit or generate content that is illegal, harmful, fraudulent, defamatory, obscene, or promotes discrimination or hatred.</li>
            <li>Infringe on the intellectual property rights of others.</li>
            <li>Attempt to bypass usage limits, subscription restrictions, or payment systems.</li>
            <li>Use automated tools such as bots or scrapers to access the service or extract data, except where expressly permitted.</li>
            <li>Probe, test, or attempt to compromise the security of our systems or infrastructure.</li>
            <li>Interfere with the service or other users' ability to access it, including through spam, viruses, or denial-of-service attacks.</li>
          </ul>
        </Section>

        <Section number="6" title="Intellectual Property">
          <p>
            All content, features, and functionality of the service that are not user-generated, including the interface, branding, code, and documentation, are the property of Prompter and its licensors, and are protected by applicable copyright, trademark, and other intellectual property laws. Nothing in these Terms grants you any rights in our proprietary materials.
          </p>
        </Section>

        <Section number="7" title="Disclaimers and Limitation of Liability">
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Provided as is.</strong> The service is provided on an "as is" and "as available" basis, without warranty of any kind. We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">AI-generated content.</strong> We do not guarantee the accuracy, safety, uniqueness, or quality of any AI-generated output. All generated content is used at your own risk.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Limitation of liability.</strong> To the fullest extent permitted by law, Prompter and its officers, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill, arising out of or related to your use of the service.
          </p>
        </Section>

        <Section number="8" title="Indemnification">
          <p>
            You agree to indemnify and hold harmless Prompter and its officers, employees, and agents from any claims, liabilities, damages, and expenses, including legal fees, arising from your use of the service, your content, or your breach of these Terms.
          </p>
        </Section>

        <Section number="9" title="Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of the Republic of Singapore, without regard to its conflict of law provisions.
          </p>
        </Section>

        <Section number="10" title="Changes to These Terms">
          <p>
            We may update these Terms from time to time. If changes are material, we will provide at least 30 days notice by posting on the website or emailing you. Continued use of the service after changes take effect constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section number="11" title="Contact">
          <p>
            If you have questions about these Terms, contact us at{' '}
            <a href="mailto:pbarath29@gmail.com" className="text-primary-500 hover:underline">pbarath29@gmail.com</a>.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default TermsPage;
