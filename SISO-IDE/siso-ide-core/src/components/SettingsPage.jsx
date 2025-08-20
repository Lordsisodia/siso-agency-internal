import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  ArrowLeft,
  Settings,
  User,
  Palette,
  Shield,
  Monitor,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';

const SettingsPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General settings
    autoSave: true,
    autoRefresh: true,
    notifications: true,
    soundEnabled: false,
    
    // Appearance settings
    theme: 'system',
    fontSize: 'medium',
    compactMode: false,
    
    // Privacy settings
    analytics: false,
    errorReporting: true,
    
    // Performance settings
    maxProjects: 50,
    cacheSize: 100,
    backgroundSync: true
  });
  
  const [saveStatus, setSaveStatus] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('sisoSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    localStorage.setItem('sisoSettings', JSON.stringify(settings));
    setSaveStatus('success');
    setHasChanges(false);
    setIsLoading(false);
    
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const resetSettings = () => {
    const defaultSettings = {
      autoSave: true,
      autoRefresh: true,
      notifications: true,
      soundEnabled: false,
      theme: 'system',
      fontSize: 'medium',
      compactMode: false,
      analytics: false,
      errorReporting: true,
      maxProjects: 50,
      cacheSize: 100,
      backgroundSync: true
    };
    
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/60">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="h-9 px-3 hover:bg-accent/80 transition-all duration-200 group rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                    <Settings className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground font-medium">Configure your SISO experience</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {saveStatus === 'success' && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Check className="w-4 h-4" />
                    Saved successfully
                  </div>
                )}
                {hasChanges && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600/40 bg-amber-50 dark:bg-amber-950/30 font-medium">
                    Unsaved changes
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                  className="h-9 px-4 hover:bg-accent/80 transition-all duration-200 border-border/60 rounded-lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={!hasChanges || isLoading}
                  className="h-9 px-4 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg rounded-lg group"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-8 h-12 p-1 bg-muted/50 rounded-xl border border-border/40">
              <TabsTrigger 
                value="general" 
                className="flex items-center gap-2 h-10 px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="flex items-center gap-2 h-10 px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex items-center gap-2 h-10 px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="flex items-center gap-2 h-10 px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Performance</span>
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 mt-0">
              <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">General Preferences</h3>
                    <p className="text-sm text-muted-foreground">Configure your basic SISO settings</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-1">
                      <Label htmlFor="auto-save" className="text-base font-medium">Auto-save changes</Label>
                      <p className="text-sm text-muted-foreground mt-1">Automatically save your work as you type</p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                      className="ml-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-1">
                      <Label htmlFor="auto-refresh" className="text-base font-medium">Auto-refresh projects</Label>
                      <p className="text-sm text-muted-foreground mt-1">Automatically refresh project list when files change</p>
                    </div>
                    <Switch
                      id="auto-refresh"
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                      className="ml-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-1">
                      <Label htmlFor="notifications" className="text-base font-medium">Enable notifications</Label>
                      <p className="text-sm text-muted-foreground mt-1">Show system notifications for important events</p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                      className="ml-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-1">
                      <Label htmlFor="sound" className="text-base font-medium">Sound effects</Label>
                      <p className="text-sm text-muted-foreground mt-1">Play sounds for notifications and actions</p>
                    </div>
                    <Switch
                      id="sound"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                      className="ml-4"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6 mt-0">
              <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Theme & Display</h3>
                    <p className="text-sm text-muted-foreground">Customize your visual experience</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="theme" className="text-base font-medium">Theme preference</Label>
                    <select
                      id="theme"
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className="w-full h-11 px-4 border border-border/60 rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 font-medium"
                    >
                      <option value="light">Light Theme</option>
                      <option value="dark">Dark Theme</option>
                      <option value="system">System Preference</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="font-size" className="text-base font-medium">Font size</Label>
                    <select
                      id="font-size"
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                      className="w-full h-11 px-4 border border-border/60 rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 font-medium"
                    >
                      <option value="small">Small (14px)</option>
                      <option value="medium">Medium (16px)</option>
                      <option value="large">Large (18px)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-1">
                      <Label htmlFor="compact-mode" className="text-base font-medium">Compact mode</Label>
                      <p className="text-sm text-muted-foreground mt-1">Use less vertical space in the interface</p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                      className="ml-4"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-0">
              <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Privacy & Data</h3>
                    <p className="text-sm text-muted-foreground">Control your data and privacy settings</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-1">
                      <Label htmlFor="analytics" className="text-base font-medium">Usage analytics</Label>
                      <p className="text-sm text-muted-foreground mt-1">Help improve SISO by sharing anonymous usage data</p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={settings.analytics}
                      onCheckedChange={(checked) => handleSettingChange('analytics', checked)}
                      className="ml-4"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-1">
                      <Label htmlFor="error-reporting" className="text-base font-medium">Error reporting</Label>
                      <p className="text-sm text-muted-foreground mt-1">Automatically report errors to help us fix issues</p>
                    </div>
                    <Switch
                      id="error-reporting"
                      checked={settings.errorReporting}
                      onCheckedChange={(checked) => handleSettingChange('errorReporting', checked)}
                      className="ml-4"
                    />
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800/40">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Privacy Notice</p>
                        <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                          SISO respects your privacy. All data is stored locally on your device, and no personal 
                          information is collected without your explicit consent. Your code and projects remain 
                          private and secure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6 mt-0">
              <Card className="p-6 shadow-lg border border-border/60 bg-card/50 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Performance Settings</h3>
                    <p className="text-sm text-muted-foreground">Optimize SISO for your workflow</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="max-projects" className="text-base font-medium">Maximum projects to track</Label>
                    <Input
                      id="max-projects"
                      type="number"
                      min="10"
                      max="200"
                      value={settings.maxProjects}
                      onChange={(e) => handleSettingChange('maxProjects', parseInt(e.target.value))}
                      className="h-11 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">Higher values may impact performance</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="cache-size" className="text-base font-medium">Cache size (MB)</Label>
                    <Input
                      id="cache-size"
                      type="number"
                      min="50"
                      max="500"
                      value={settings.cacheSize}
                      onChange={(e) => handleSettingChange('cacheSize', parseInt(e.target.value))}
                      className="h-11 border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">Amount of data to cache for faster loading</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors duration-200">
                    <div className="flex-1">
                      <Label htmlFor="background-sync" className="text-base font-medium">Background sync</Label>
                      <p className="text-sm text-muted-foreground mt-1">Keep projects synchronized in the background</p>
                    </div>
                    <Switch
                      id="background-sync"
                      checked={settings.backgroundSync}
                      onCheckedChange={(checked) => handleSettingChange('backgroundSync', checked)}
                      className="ml-4"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;