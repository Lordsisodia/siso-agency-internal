/**
 * Tracking Reminders Component
 * Displays in-app reminder notifications and settings
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Clock, Check, Settings, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTrackingReminders, ReminderConfig } from '../../hooks/useTrackingReminders';
import { cn } from '@/lib/utils';

interface ReminderToastProps {
  reminder: { id: string; config: ReminderConfig };
  onDismiss: (id: string) => void;
  onSnooze: (id: string) => void;
}

const ReminderToast: React.FC<ReminderToastProps> = ({ reminder, onDismiss, onSnooze }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-amber-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-lg min-w-[300px] max-w-[400px]"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0">
          <Bell className="h-5 w-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-amber-100 text-sm">{reminder.config.title}</h4>
          <p className="text-amber-200/70 text-xs mt-1">{reminder.config.message}</p>
        </div>
        <button
          onClick={() => onDismiss(reminder.id)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onSnooze(reminder.id)}
          className="flex-1 h-8 text-xs bg-white/5 hover:bg-white/10 text-slate-300"
        >
          <Clock className="h-3 w-3 mr-1" />
          Snooze 30m
        </Button>
        <Button
          size="sm"
          onClick={() => onDismiss(reminder.id)}
          className="flex-1 h-8 text-xs bg-amber-600 hover:bg-amber-500 text-white"
        >
          <Check className="h-3 w-3 mr-1" />
          Got it
        </Button>
      </div>
    </motion.div>
  );
};

interface ReminderSettingsProps {
  reminders: ReminderConfig[];
  permission: NotificationPermission;
  isSupported: boolean;
  onToggle: (id: string) => void;
  onRequestPermission: () => void;
}

const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  reminders,
  permission,
  isSupported,
  onToggle,
  onRequestPermission,
}) => {
  return (
    <div className="space-y-4">
      {/* Browser Notification Permission */}
      {isSupported && permission !== 'granted' && (
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-100">Enable Browser Notifications</p>
              <p className="text-xs text-amber-200/60">
                Get reminded even when the app is in the background
              </p>
            </div>
            <Button
              size="sm"
              onClick={onRequestPermission}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Enable
            </Button>
          </div>
        </div>
      )}

      {isSupported && permission === 'granted' && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-400" />
          <p className="text-sm text-green-100">Browser notifications enabled</p>
        </div>
      )}

      {!isSupported && (
        <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 flex items-center gap-3">
          <BellOff className="h-5 w-5 text-slate-400" />
          <p className="text-sm text-slate-300">Browser notifications not supported in this browser</p>
        </div>
      )}

      {/* Reminder List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Tracking Reminders</h4>
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all",
              reminder.enabled
                ? "bg-amber-900/10 border-amber-600/20"
                : "bg-slate-800/30 border-slate-700/30"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                reminder.enabled ? "text-amber-100" : "text-slate-400"
              )}>
                {reminder.title.replace(/[💧🍎🚭☕🌿🍺📱⚡]/g, '').trim()}
              </p>
              <p className="text-xs text-slate-500">
                {reminder.frequency === 'hourly'
                  ? `Every ${reminder.intervalMinutes || 60} mins`
                  : `Daily at ${reminder.startTime || '09:00'}`}
              </p>
            </div>
            <Switch
              checked={reminder.enabled}
              onCheckedChange={() => onToggle(reminder.id)}
              className="data-[state=checked]:bg-amber-600"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrackingReminders: React.FC = () => {
  const {
    reminders,
    permission,
    inAppReminders,
    isSupported,
    requestPermission,
    toggleReminder,
    dismissInAppReminder,
    snoozeReminder,
  } = useTrackingReminders();

  return (
    <>
      {/* In-App Reminder Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {inAppReminders.map((reminder) => (
            <div key={reminder.id} className="pointer-events-auto">
              <ReminderToast
                reminder={reminder}
                onDismiss={dismissInAppReminder}
                onSnooze={snoozeReminder}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Settings Dialog Trigger */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
          >
            <Bell className="h-4 w-4 mr-2" />
            Reminders
            {inAppReminders.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                {inAppReminders.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <Settings className="h-5 w-5 text-amber-400" />
              Reminder Settings
            </DialogTitle>
          </DialogHeader>
          <ReminderSettings
            reminders={reminders}
            permission={permission}
            isSupported={isSupported}
            onToggle={toggleReminder}
            onRequestPermission={requestPermission}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrackingReminders;
