import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-siso-bg text-siso-text p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-siso-red hover:text-siso-orange mb-8 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-siso-text-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Siso Resource Hub, you accept and agree to be bound by these Terms of Service.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>Siso Resource Hub is a platform that provides agency resources, tools, and community features to help businesses scale effectively.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must notify us of any unauthorized use of your account</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use the service for any illegal purpose</li>
              <li>Share your account credentials</li>
              <li>Attempt to access other users' accounts</li>
              <li>Upload malicious content or software</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p>All content and materials available on Siso Resource Hub are protected by intellectual property rights.</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
            <p>For any questions regarding these Terms of Service, please contact us at:</p>
            <p>Email: terms@siso-resource-hub.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;