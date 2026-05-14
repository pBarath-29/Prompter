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

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-center text-gray-400 mb-10">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <Section number="1" title="Introduction">
          <p>
            Prompter is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, who we share it with, and what rights you have over it. By using the service, you agree to the practices described here.
          </p>
        </Section>

        <Section number="2" title="Information We Collect">
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Account information.</strong> When you register, we collect your name and email address. If you sign up via Google OAuth, we receive the name, email, and profile photo associated with your Google account. You may also provide optional profile information such as a biography and avatar image.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Content you create.</strong> We store all prompts, collections, comments, and feedback you submit to the service.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Usage data.</strong> We track your prompt generation count and submission counts per billing period to enforce your subscription tier limits. We also store your generation history so you can reference past results.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Payment information.</strong> When you subscribe to Pro or purchase a collection, payment is handled entirely by our third-party payment processor. We do not store your card details. We only receive a confirmation of payment and a customer reference.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Preferences.</strong> Your theme preference (light or dark mode) is stored in your account and in your browser's local storage so it persists across sessions.
          </p>
        </Section>

        <Section number="3" title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Create and manage your account and authenticate your identity.</li>
            <li>Provide the prompt generation service, including sending your input to the Gemini API to produce a result.</li>
            <li>Display your public profile and any content you have shared in the community or marketplace.</li>
            <li>Process subscription payments and marketplace purchases.</li>
            <li>Send account-related emails, including email verification and password reset links.</li>
            <li>Enforce subscription tier limits and detect abuse.</li>
            <li>Investigate reports, moderate content, and enforce our Terms and Conditions.</li>
          </ul>
        </Section>

        <Section number="4" title="How We Share Your Information">
          <p>We do not sell your personal data. We share information only in the following circumstances:</p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">With other users.</strong> Your name, avatar, and bio are visible on your public profile. Any prompts, collections, and comments you publish are visible to other users.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">With service providers.</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-gray-700 dark:text-gray-300">Firebase (Google).</strong> We use Firebase for user authentication and database storage. Your account data and content are stored in Firebase Realtime Database.</li>
            <li><strong className="text-gray-700 dark:text-gray-300">Google Gemini API.</strong> When you generate a prompt, we send your description, selected tone, and category to the Gemini API. We do not send your name, email, or any other personally identifying information with these requests.</li>
            <li><strong className="text-gray-700 dark:text-gray-300">Payment processors.</strong> We use third-party processors to handle subscription and marketplace payments securely.</li>
          </ul>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">For legal reasons.</strong> We may disclose your information if required by law or in response to a valid legal request from a public authority.
          </p>
          <p>
            <strong className="text-gray-800 dark:text-gray-200">Business transfers.</strong> If Prompter is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you before that happens.
          </p>
        </Section>

        <Section number="5" title="Data Retention and Security">
          <p>
            We retain your personal information for as long as your account is active. If you delete your account, we remove your personal details (name, email) from our systems. Your public content (prompts, comments, collections) is anonymised and attributed to a "Deleted User" rather than deleted, to maintain the integrity of community history.
          </p>
          <p>
            We rely on the security infrastructure provided by Firebase and our other service providers to protect your data. While we take reasonable steps to safeguard your information, no system is completely secure and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section number="6" title="Your Rights">
          <p>Through your account settings, you can:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>View and edit your profile information at any time.</li>
            <li>Change your password through the profile settings page.</li>
            <li>Delete your account, which removes your personal data as described above.</li>
          </ul>
          <p>
            For any data requests that cannot be handled through the profile settings, contact us at the address below.
          </p>
        </Section>

        <Section number="7" title="Cookies and Local Storage">
          <p>
            We do not use advertising or tracking cookies. Firebase, our authentication provider, uses browser storage mechanisms (including IndexedDB and local storage) to manage your login session securely. Clearing your browser storage will log you out of the service. We also store your theme preference in local storage so it is remembered between visits.
          </p>
        </Section>

        <Section number="8" title="Children's Privacy">
          <p>
            The service is not directed at children under the age of 14. We do not knowingly collect personal information from children under 14. If you believe a child has provided us with their information, please contact us and we will delete it.
          </p>
        </Section>

        <Section number="9" title="Governing Law">
          <p>
            This Privacy Policy is governed by the laws of the Republic of Singapore.
          </p>
        </Section>

        <Section number="10" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will post the revised policy on this page with an updated date. For material changes, we will also notify you by email where possible.
          </p>
        </Section>

        <Section number="11" title="Contact">
          <p>
            For questions or concerns about this Privacy Policy, contact us at{' '}
            <a href="mailto:pbarath29@gmail.com" className="text-primary-500 hover:underline">pbarath29@gmail.com</a>{' '}
            or use the Feedback link in the footer.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default PrivacyPage;
