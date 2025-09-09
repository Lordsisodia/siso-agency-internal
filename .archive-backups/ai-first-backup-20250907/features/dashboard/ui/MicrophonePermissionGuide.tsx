import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { AlertCircle, Mic, Settings, Globe } from 'lucide-react';

interface MicrophonePermissionGuideProps {
  onClose: () => void;
}

export const MicrophonePermissionGuide: React.FC<MicrophonePermissionGuideProps> = ({ onClose }) => {
  const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
  };

  const browser = getBrowser();

  return (
    <Card className="w-full max-w-lg bg-gray-900/95 border-orange-500/30 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-400">
          <Mic className="h-5 w-5 mr-2" />
          Enable Microphone for Voice Commands
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="text-sm text-yellow-300">
            <strong>Quick Fix:</strong> Look for the microphone icon 🎤 in your browser's address bar and click "Allow"
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-white flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            {browser} Instructions:
          </h4>
          
          {browser === 'Chrome' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="text-sm text-red-300">
                  <strong>🚨 Chrome Nuclear Reset (If Nothing Else Works):</strong>
                  <ol className="mt-2 space-y-1 list-decimal list-inside ml-2">
                    <li>Copy: <code className="bg-gray-800 px-1 rounded">chrome://settings/content/all</code></li>
                    <li>Paste in address bar, find your site, click <strong>trash icon</strong></li>
                    <li>Copy: <code className="bg-gray-800 px-1 rounded">chrome://settings/content/microphone</code></li>
                    <li>Delete site from "Not allowed", add to "Allowed"</li>
                    <li>Close ALL Chrome windows, restart Chrome</li>
                  </ol>
                </div>
              </div>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>Click the <strong>microphone icon 🎤</strong> in the address bar</li>
                <li>Select <strong>"Always allow"</strong></li>
                <li>Or go to Settings → Privacy and security → Site settings → Microphone</li>
                <li>Add this site to the <strong>"Allow"</strong> list</li>
              </ol>
            </div>
          )}

          {browser === 'Safari' && (
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Click <strong>Safari → Settings → Websites</strong></li>
              <li>Click <strong>"Microphone"</strong> in the left sidebar</li>
              <li>Find this website and set to <strong>"Allow"</strong></li>
              <li>Refresh the page</li>
            </ol>
          )}

          {browser === 'Edge' && (
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Click the <strong>three dots menu (⋯)</strong> → Settings</li>
              <li>Go to <strong>Cookies and site permissions → Microphone</strong></li>
              <li>Add this site to the <strong>"Allow"</strong> list</li>
              <li>Refresh the page</li>
            </ol>
          )}

          {browser === 'Firefox' && (
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Click the <strong>shield icon</strong> in the address bar</li>
              <li>Click <strong>"Turn off Enhanced Tracking Protection"</strong></li>
              <li>Or go to Settings → Privacy & Security → Permissions</li>
              <li>Set microphone to <strong>"Allow"</strong> for this site</li>
            </ol>
          )}

          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="text-sm text-blue-300">
              <strong>Still having issues?</strong> Make sure:
              <ul className="mt-2 space-y-1 list-disc list-inside ml-2">
                <li>Your microphone is connected and working</li>
                <li>No other apps are using your microphone</li>
                <li>You're using HTTPS (secure connection)</li>
                <li>Try refreshing the page after changing permissions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Close Guide
          </Button>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};