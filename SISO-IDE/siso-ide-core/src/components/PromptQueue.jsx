import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';

const PromptQueue = ({ onSendPrompt, isProcessing }) => {
  const [queue, setQueue] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoProcess, setAutoProcess] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('siso-prompt-queue');
    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue);
        setQueue(parsed.queue || []);
        setCurrentIndex(parsed.currentIndex || 0);
      } catch (e) {
        console.error('Error loading prompt queue:', e);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('siso-prompt-queue', JSON.stringify({
      queue,
      currentIndex
    }));
  }, [queue, currentIndex]);

  // Auto-process next prompt when current one is done
  useEffect(() => {
    if (!isProcessing && autoProcess && queue.length > 0 && currentIndex < queue.length) {
      const timer = setTimeout(() => {
        processNextPrompt();
      }, 1000); // 1 second delay between prompts
      
      return () => clearTimeout(timer);
    }
  }, [isProcessing, autoProcess, queue.length, currentIndex]);

  const addToQueue = () => {
    if (newPrompt.trim()) {
      const prompt = {
        id: Date.now(),
        text: newPrompt.trim(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      setQueue(prev => [...prev, prompt]);
      setNewPrompt('');
    }
  };

  const removeFromQueue = (id) => {
    setQueue(prev => prev.filter(p => p.id !== id));
    // Adjust current index if necessary
    const removedIndex = queue.findIndex(p => p.id === id);
    if (removedIndex !== -1 && removedIndex < currentIndex) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const processNextPrompt = () => {
    if (queue.length > 0 && currentIndex < queue.length) {
      const prompt = queue[currentIndex];
      if (prompt && onSendPrompt) {
        // Mark current prompt as processing
        setQueue(prev => prev.map((p, i) => 
          i === currentIndex 
            ? { ...p, status: 'processing' }
            : p
        ));
        
        onSendPrompt(prompt.text);
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
    setAutoProcess(false);
  };

  const movePromptUp = (index) => {
    if (index > 0) {
      const newQueue = [...queue];
      [newQueue[index - 1], newQueue[index]] = [newQueue[index], newQueue[index - 1]];
      setQueue(newQueue);
    }
  };

  const movePromptDown = (index) => {
    if (index < queue.length - 1) {
      const newQueue = [...queue];
      [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
      setQueue(newQueue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      addToQueue();
    }
  };

  return (
    <Card className="p-4 space-y-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Prompt Queue</h3>
        <div className="flex items-center gap-2">
          <Badge variant={queue.length > 0 ? "default" : "secondary"}>
            {queue.length} prompts
          </Badge>
          {queue.length > 0 && (
            <Badge variant="outline">
              {currentIndex}/{queue.length} processed
            </Badge>
          )}
        </div>
      </div>

      {/* Add New Prompt */}
      <div className="space-y-2">
        <Textarea
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your prompt here... (Shift+Enter to add to queue)"
          className="min-h-[80px] resize-none"
        />
        <div className="flex gap-2">
          <Button 
            onClick={addToQueue}
            disabled={!newPrompt.trim()}
            className="flex-1"
          >
            Add to Queue
          </Button>
          <Button
            onClick={() => {
              if (newPrompt.trim() && onSendPrompt) {
                onSendPrompt(newPrompt);
                setNewPrompt('');
              }
            }}
            disabled={!newPrompt.trim() || isProcessing}
            variant="outline"
          >
            Send Now
          </Button>
        </div>
      </div>

      {/* Queue Controls */}
      {queue.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={processNextPrompt}
            disabled={isProcessing || currentIndex >= queue.length}
            size="sm"
          >
            Process Next
          </Button>
          <Button
            onClick={() => setAutoProcess(!autoProcess)}
            variant={autoProcess ? "default" : "outline"}
            size="sm"
          >
            Auto Process: {autoProcess ? 'ON' : 'OFF'}
          </Button>
          <Button
            onClick={clearQueue}
            variant="destructive"
            size="sm"
          >
            Clear Queue
          </Button>
        </div>
      )}

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="font-medium text-sm text-slate-600 dark:text-slate-400">
            Queued Prompts:
          </h4>
          {queue.map((prompt, index) => (
            <div
              key={prompt.id}
              className={`p-3 rounded-lg border ${
                index < currentIndex
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : index === currentIndex && isProcessing
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm break-words">
                    {prompt.text.length > 100 
                      ? `${prompt.text.slice(0, 100)}...` 
                      : prompt.text
                    }
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={
                        index < currentIndex 
                          ? "success" 
                          : index === currentIndex && isProcessing 
                          ? "default" 
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {index < currentIndex 
                        ? 'Completed' 
                        : index === currentIndex && isProcessing 
                        ? 'Processing' 
                        : 'Pending'
                      }
                    </Badge>
                    <span className="text-xs text-slate-500">
                      #{index + 1}
                    </span>
                  </div>
                </div>
                
                {index >= currentIndex && (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      <Button
                        onClick={() => movePromptUp(index)}
                        disabled={index === 0}
                        size="xs"
                        variant="ghost"
                        className="p-1 h-6 w-6"
                      >
                        ↑
                      </Button>
                      <Button
                        onClick={() => movePromptDown(index)}
                        disabled={index === queue.length - 1}
                        size="xs"
                        variant="ghost"
                        className="p-1 h-6 w-6"
                      >
                        ↓
                      </Button>
                    </div>
                    <Button
                      onClick={() => removeFromQueue(prompt.id)}
                      size="xs"
                      variant="destructive"
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use Shift+Enter in the text area to quickly add prompts</li>
          <li>Enable Auto Process for hands-free queue processing</li>
          <li>Reorder prompts using ↑↓ buttons</li>
          <li>Queue persists across browser sessions</li>
        </ul>
      </div>
    </Card>
  );
};

export default PromptQueue;