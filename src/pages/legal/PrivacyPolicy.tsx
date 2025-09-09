import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-siso-bg text-siso-text p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-siso-red hover:text-siso-orange mb-8 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-siso-text-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>Welcome to Siso Resource Hub. We respect your privacy and are committed to protecting your personal data.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
            <p>When you use our service, we may collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name and email address when you sign up</li>
              <li>Profile information from your Google account if you use Gmail login</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our service</li>
              <li>Notify you about changes to our service</li>
              <li>Provide customer support</li>
              <li>Monitor the usage of our service</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. Your data is stored securely in our Supabase database with strict access controls.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>Email: privacy@siso-resource-hub.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;