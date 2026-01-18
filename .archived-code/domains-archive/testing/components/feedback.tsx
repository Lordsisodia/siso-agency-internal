import React, { useState } from 'react';

export const CleanFeedbackManager: React.FC<{ onSubmit?: (items: any[]) => Promise<void> }>
  = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const submit = async () => {
    if (!text.trim()) return;
    await onSubmit?.([{ text, created_at: new Date().toISOString(), submitted: true }]);
    setText('');
  };
  return (
    <div className="space-y-3">
      <textarea className="w-full border rounded p-2" value={text} onChange={e => setText(e.target.value)} />
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>Submit</button>
    </div>
  );
};

export const SimpleFeedbackList: React.FC<{ title?: string; onSubmit?: (items: any[]) => Promise<void> }>
  = ({ title = 'Feedback', onSubmit }) => {
  const [text, setText] = useState('');
  const submit = async () => {
    if (!text.trim()) return;
    await onSubmit?.([{ text, created_at: new Date().toISOString(), submitted: true }]);
    setText('');
  };
  return (
    <div className="space-y-3">
      <h4 className="font-semibold">{title}</h4>
      <textarea className="w-full border rounded p-2" value={text} onChange={e => setText(e.target.value)} />
      <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={submit}>Send</button>
    </div>
  );
};

export default CleanFeedbackManager;
