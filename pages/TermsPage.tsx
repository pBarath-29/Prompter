import React from 'react';

const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">{title}</h2>
    <div className="space-y-4 text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none">
      {children}
    </div>
  </div>
);

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-fade-in">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900 dark:text-white">Terms and Conditions</h1>
      <p className="mb-8 text-sm text-center text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
      
      <LegalSection title="1. Agreement to Terms">
        <p>
          Welcome to Prompter ("Company", "we", "our", "us"). These Terms and Conditions ("Terms") govern your use of our website, services, and applications (collectively, the "Service"). By creating an account, accessing, or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. User Accounts">
        <p>
          <strong>Account Creation:</strong> To access certain features of the Service, such as prompt generation, community features, and the marketplace, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. Account creation requires email verification.
        </p>
        <p>
          <strong>Account Responsibility:</strong> You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. We are not liable for any loss or damage arising from your failure to comply with this security obligation.
        </p>
         <p>
          <strong>Age Requirement:</strong> You must be at least 14 years old to create an account and use the Service. By creating an account, you represent that you meet this requirement.
        </p>
        <p>
            <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account at our sole discretion, without prior notice or liability, for any reason, including but not to a breach of these Terms. Upon termination, your right to use the Service will immediately cease. If you wish to terminate your own account, you may do so through your profile settings.
        </p>
      </LegalSection>

      <LegalSection title="3. User-Generated Content (UGC)">
        <p>
          <strong>Your Content:</strong> Our Service allows you to create, upload, post, send, and store content, including but not to AI prompts, prompt collections, descriptions, tags, comments, and feedback ("User Content"). You retain all ownership rights in the User Content you create.
        </p>
        <p>
          <strong>License Grant to Us:</strong> By making any User Content available through the Service, you grant to Prompter a non-exclusive, transferable, worldwide, royalty-free license, with the right to sublicense, to use, copy, modify, create derivative works based upon, distribute, publicly display, and publicly perform your User Content in connection with operating, marketing, and providing the Service to you and to other users. This license is necessary for us to display your prompts in the community, manage marketplace collections, and otherwise operate the platform.
        </p>
        <p>
          <strong>AI-Assisted Content:</strong> You acknowledge that parts of your User Content (such as prompts generated via our tools) may be created with the assistance of AI. Your responsibility for User Content, as outlined in these Terms, extends to any AI-assisted portions.
        </p>
        <p>
          <strong>Content Moderation:</strong> All User Content submitted to public areas of the Service, such as the Community or Marketplace, is subject to review and moderation by us. We reserve the right to approve, reject, or remove any User Content at our sole discretion, for any reason, without notice.
        </p>
         <p>
          <strong>Content Responsibility:</strong> You are solely responsible for all your User Content. You represent and warrant that you own all your User Content or you have all rights that are necessary to grant us the license rights in your User Content under these Terms. You also represent and warrant that neither your User Content, nor your use and provision of your User Content, will infringe, misappropriate or violate a third party’s intellectual property rights, or rights of publicity or privacy, or result in the violation of any applicable law or regulation.
        </p>
      </LegalSection>

       <LegalSection title="4. Subscriptions, Marketplace, and Payments">
        <p>
          <strong>Service Tiers:</strong> We offer both a free and a paid "Pro" subscription tier. The limitations for each tier, including but not to the number of AI prompt generations and community submissions per day/month, are outlined on our Upgrade page and are subject to change.
        </p>
        <p>
          <strong>Marketplace Purchases:</strong> The Service includes a marketplace where users can purchase collections of prompts. All purchases are final and non-refundable, except as required by applicable law. Prices are set by the collection creator and are subject to change.
        </p>
        <p>
          <strong>Subscription Payments:</strong> Pro subscriptions are billed on a recurring basis (e.g., monthly). Your subscription will automatically renew at the end of each billing cycle unless you cancel it through your account settings prior to the renewal date. We use third-party payment processors to handle all payment transactions. We do not store your full credit card information.
        </p>
        <p>
          <strong>Cancellation:</strong> You may cancel your Pro subscription at any time. The cancellation will take effect at the end of the current billing period, and you will retain access to Pro features until that date. No refunds will be provided for partial subscription periods.
        </p>
        <p>
          <strong>Promotional Codes:</strong> We may, at our discretion, offer promotional codes that provide a discount. Each code is subject to its own terms, including usage limits and expiration dates. Promo codes are not redeemable for cash and may be revoked at any time.
        </p>
      </LegalSection>

      <LegalSection title="5. Prohibited Conduct">
        <p>You agree not to do any of the following:</p>
        <ul>
            <li>Post, upload, or generate any content that is illegal, harmful, fraudulent, deceptive, defamatory, obscene, or promotes discrimination, bigotry, racism, or hatred.</li>
            <li>Use the Service to infringe upon the intellectual property rights of others.</li>
            <li>Attempt to circumvent any usage limits, subscription features, or payment systems.</li>
            <li>Use automated systems, such as bots or scrapers, to access the Service or extract data, except as expressly permitted by us.</li>
            <li>Attempt to probe, scan, or test the vulnerability of our systems or network, or breach any security or authentication measures.</li>
            <li>Interfere with the access of any user, host, or network, including by sending a virus, overloading, or spamming the Service.</li>
        </ul>
      </LegalSection>
      
      <LegalSection title="6. Intellectual Property Rights">
        <p>
          Excluding your User Content, the Service and its original content (including but not to text, graphics, logos, icons, images, software), features, and functionality are and will remain the exclusive property of Prompter and its licensors. The Service is protected by copyright, trademark, and other laws of both Singapore and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Prompter.
        </p>
      </LegalSection>

      <LegalSection title="7. Disclaimers and Limitation of Liability">
        <p>
          <strong>"AS IS" Service:</strong> THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>
          <strong>AI-Generated Content:</strong> Prompter utilizes third-party AI models, such as the Google Gemini API, to generate content. We do not guarantee the accuracy, safety, uniqueness, or quality of any AI-generated prompts or example outputs. The use of any content generated by or through the Service is at your own risk. You are solely responsible for verifying the content and ensuring it is appropriate for your intended use. You are also responsible for ensuring that your use of any generated content complies with all applicable laws and does not infringe on the rights of any third party.
        </p>
         <p>
          <strong>Limitation of Liability:</strong> TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL PROMPTER, ITS AFFILIATES, OFFICERS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR USE OF OR INABILITY TO USE THE SERVICE; (II) ANY CONTENT OBTAINED FROM THE SERVICE; OR (III) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR ACCOUNT OR CONTENT.
        </p>
      </LegalSection>

      <LegalSection title="8. Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless Prompter and its affiliates, officers, agents, and employees from and against any and all claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with your access to or use of the Service, your User Content, or your violation of these Terms.
        </p>
      </LegalSection>
      
      <LegalSection title="9. Governing Law">
        <p>
          These Terms shall be governed and construed in accordance with the laws of the Republic of Singapore, without regard to its conflict of law provisions.
        </p>
      </LegalSection>

      <LegalSection title="10. General Terms">
        <p><strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.</p>
        <p><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between us regarding our Service and supersede and replace any prior agreements we might have had between us regarding the Service.</p>
      </LegalSection>

      <LegalSection title="11. Changes to Terms">
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect, either by posting on our website or by sending an email to the address associated with your account. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact Us">
        <p>
          If you have any questions about these Terms, please contact us at <a href="mailto:pbarath29@gmail.com" className="text-primary-500 hover:underline">pbarath29@gmail.com</a>.
        </p>
      </LegalSection>
    </div>
  );
};

export default TermsPage;