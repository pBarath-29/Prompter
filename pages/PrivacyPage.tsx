import React from 'react';

const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">{title}</h2>
    <div className="space-y-4 text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none">
      {children}
    </div>
  </div>
);

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-fade-in">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
      <p className="mb-8 text-sm text-center text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
      
      <LegalSection title="1. Introduction">
        <p>
          Prompter ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>We collect several types of information for various purposes to provide and improve our Service to you.</p>
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Information You Provide to Us</h3>
            <ul>
                <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, and a hashed version of your password. You may also voluntarily provide additional profile information, such as a biography, an avatar image, and a theme preference (light/dark).</li>
                <li><strong>User-Generated Content:</strong> We collect all content you create and submit to the Service, including prompts, prompt collections, descriptions, tags, comments, and feedback messages.</li>
                <li><strong>Payment Information:</strong> When you subscribe to our Pro plan or purchase a collection from the marketplace, our third-party payment processor (e.g., Stripe) will collect your payment information. We do not directly store sensitive payment details such as your full credit card number. We only receive a token or confirmation of payment.</li>
                <li><strong>Communications:</strong> If you contact us directly, such as through our feedback page, we will collect your name, email address, and the contents of your message.</li>
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Information We Collect Automatically</h3>
             <ul>
                <li><strong>Browser Storage:</strong> We use your browser's local storage to enhance your experience. For example, if you are not logged in, we save your theme preference (light/dark mode) in local storage so the site remembers your choice on your next visit. Our authentication provider (Firebase) may also use browser storage mechanisms like IndexedDB to securely manage your login session. This is essential for keeping you logged in. You can clear your browser's storage, but this may log you out or reset your preferences.</li>
            </ul>
        </div>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <p>We use the information we collect for various purposes, including to:</p>
        <ul>
            <li>Provide, operate, secure, and maintain our Service.</li>
            <li>Manage your account, including processing your subscriptions, purchases, and payments.</li>
            <li>Display your public profile and User-Generated Content to other users as part of our community and marketplace features.</li>
            <li>Personalize your experience, for instance, by remembering your theme preference.</li>
            <li>Communicate with you, including sending important account-related emails (like email verification and password resets) and responding to your feedback or inquiries.</li>
            <li>Track your prompt generation and submission counts to enforce the limits of your subscription tier.</li>
            <li>Prevent fraud, enforce our Terms and Conditions, and comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How We Share Your Information">
        <p>We do not sell your personal information. We may share your information in the following limited circumstances:</p>
        <ul>
            <li><strong>With Other Users:</strong> Your public profile information (name, avatar, bio) and any content you submit publicly (approved prompts, collections, comments) are visible to other users of the Service.</li>
            <li><strong>With Third-Party Service Providers:</strong> We share information with third-party vendors who help us operate our Service. These include:
                <ul>
                  <li><strong>Firebase (Google):</strong> For database hosting, user authentication, and analytics.</li>
                  <li><strong>Google Gemini API:</strong> When you use our prompt generator, we send the necessary inputs (your description, chosen tone, and category) to the Gemini API to generate the prompt. We do not send any of your personal identifying information (like your name or email) with these API requests; only the content required to generate the prompt is sent.</li>
                  <li><strong>Payment Processors (e.g., Stripe):</strong> To securely handle payments for subscriptions and marketplace purchases.</li>
                </ul>
                These providers only have access to the information necessary to perform their functions and are contractually obligated to protect it.
            </li>
            <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your information may be transferred.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Data Security and Retention">
        <p>
          We take reasonable measures to protect your information from loss, theft, misuse, and unauthorized access. We rely on the security infrastructure of our service providers, like Firebase, to safeguard your data. However, no electronic transmission or storage is 100% secure.
        </p>
        <p>
          We retain your personal information as long as your account is active. If you choose to delete your account, we will delete your personally identifiable information (such as name and email). Your User-Generated Content (prompts, collections, etc.) will be anonymized by attributing it to a "Deleted User" to maintain the integrity of community interactions.
        </p>
      </LegalSection>

      <LegalSection title="6. Your Data Protection Rights">
        <p>
          You have rights over your personal information. Through your account's profile page, you have the ability to:
        </p>
        <ul>
            <li><strong>Access and Update:</strong> You can view and edit your profile information, such as your name, bio, and avatar at any time.</li>
            <li><strong>Delete:</strong> You have the right to delete your account, which will remove your personal data and anonymize your content as described above.</li>
        </ul>
        <p>If you have any requests regarding your data that you cannot perform through your profile, please contact us.</p>
      </LegalSection>
      
      <LegalSection title="7. Children's Privacy">
        <p>
          Our Service is not directed to individuals under the age of 14. We do not knowingly collect personally identifiable information from children under 14. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
        </p>
      </LegalSection>

      <LegalSection title="8. Governing Law">
        <p>
          This Privacy Policy shall be governed by and construed in accordance with the laws of Singapore.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Privacy Policy">
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We may also notify you via email if the changes are material.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact Us">
        <p>
          If you have any questions about this Privacy Policy, you can use the "Feedback" link in the footer of our website. For privacy-related concerns, you can also contact us directly at <a href="mailto:pbarath29@gmail.com" className="text-primary-500 hover:underline">pbarath29@gmail.com</a>.
        </p>
      </LegalSection>
    </div>
  );
};

export default PrivacyPage;