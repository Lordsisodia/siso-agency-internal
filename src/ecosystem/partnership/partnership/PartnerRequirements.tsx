import React from 'react';

export function PartnerRequirements() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Partner Requirements
          </h2>
          <p className="text-xl text-gray-300">
            What we look for in our agency partners
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              🎯 Experience & Expertise
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• 2+ years in digital marketing or web development</li>
              <li>• Portfolio of successful client projects</li>
              <li>• Understanding of modern web technologies</li>
              <li>• Client relationship management experience</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              💼 Business Requirements
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Registered business entity</li>
              <li>• Professional liability insurance</li>
              <li>• Dedicated client communication channels</li>
              <li>• Commitment to quality deliverables</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              🤝 Partnership Values
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Collaborative approach to client success</li>
              <li>• Transparent communication practices</li>
              <li>• Commitment to continuous learning</li>
              <li>• Alignment with SISO brand values</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              📈 Growth Mindset
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Scalable service delivery processes</li>
              <li>• Investment in team development</li>
              <li>• Technology adoption readiness</li>
              <li>• Long-term partnership vision</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-orange-300 mb-4">
              Ready to Partner With Us?
            </h3>
            <p className="text-gray-300 mb-4">
              If you meet these requirements and share our vision for exceptional client service, we'd love to hear from you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}