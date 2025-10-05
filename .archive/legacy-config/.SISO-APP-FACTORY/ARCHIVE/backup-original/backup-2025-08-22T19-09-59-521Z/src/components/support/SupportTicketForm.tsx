/**
 * Support Ticket Form Component
 * 
 * Advanced form for creating support tickets with categorization,
 * priority levels, file attachments, and detailed issue description.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Upload, 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  FileText,
  Image,
  Paperclip,
  User,
  Mail,
  MessageSquare,
  Tag,
  Flag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface SupportTicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (ticketData: TicketData) => void;
}

interface TicketData {
  category: string;
  priority: string;
  subject: string;
  description: string;
  contactMethod: string;
  clientAffected?: string;
  dealValue?: string;
  urgentReason?: string;
  attachments: File[];
  requestCallback: boolean;
  anonymousSubmission: boolean;
}

interface AttachmentPreview {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'other';
}

export function SupportTicketForm({ isOpen, onClose, onSubmit }: SupportTicketFormProps) {
  const [formData, setFormData] = useState<TicketData>({
    category: '',
    priority: 'medium',
    subject: '',
    description: '',
    contactMethod: 'email',
    clientAffected: '',
    dealValue: '',
    urgentReason: '',
    attachments: [],
    requestCallback: false,
    anonymousSubmission: false
  });

  const [attachmentPreviews, setAttachmentPreviews] = useState<AttachmentPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const categories = [
    { value: 'technical', label: 'Technical Support', icon: '🔧', description: 'Platform issues, bugs, portal problems' },
    { value: 'commission', label: 'Commission & Payments', icon: '💰', description: 'Payment issues, commission questions' },
    { value: 'referral', label: 'Referral Support', icon: '👥', description: 'Client referral assistance, tracking issues' },
    { value: 'training', label: 'Training & Education', icon: '📚', description: 'Learning resources, best practices' },
    { value: 'account', label: 'Account Management', icon: '👤', description: 'Profile updates, access issues' },
    { value: 'marketing', label: 'Marketing Materials', icon: '📢', description: 'Brochures, templates, co-marketing' },
    { value: 'urgent', label: 'Urgent Business Issue', icon: '🚨', description: 'Time-sensitive deal or client matters' },
    { value: 'feedback', label: 'Feedback & Suggestions', icon: '💡', description: 'Product feedback, feature requests' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-blue-500', description: 'General questions, non-urgent matters' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-500', description: 'Important but not time-critical' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-500', description: 'Urgent issues affecting business' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500', description: 'Emergency - immediate attention required' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const preview: AttachmentPreview = {
        file,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other'
      };

      if (preview.type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.preview = e.target?.result as string;
          setAttachmentPreviews(prev => [...prev, preview]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreviews(prev => [...prev, preview]);
      }

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, file]
      }));
    });

    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const ticketId = `TICKET-${Date.now()}`;
    console.log('Support ticket submitted:', { ...formData, ticketId });
    
    if (onSubmit) {
      onSubmit(formData);
    }
    
    setIsSubmitting(false);
    onClose();
    
    // Show success message
    alert(`Support ticket ${ticketId} submitted successfully! You'll receive a confirmation email shortly.`);
  };

  const isFormValid = () => {
    return formData.category && formData.subject && formData.description.length >= 20;
  };

  const getExpectedResponseTime = () => {
    switch (formData.priority) {
      case 'critical': return '< 1 hour';
      case 'high': return '< 4 hours';
      case 'medium': return '< 24 hours';
      case 'low': return '< 48 hours';
      default: return '< 24 hours';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-black border-orange-500/20">
          <CardHeader className="border-b border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-white flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-orange-500" />
                  Create Support Ticket
                </CardTitle>
                <p className="text-gray-400 mt-1">
                  Get help from our partnership specialists - we're here to support your success
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-4 mt-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step >= stepNum ? "bg-orange-500 text-white" : "bg-gray-700 text-gray-400"
                  )}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={cn(
                      "w-12 h-0.5 mx-2",
                      step > stepNum ? "bg-orange-500" : "bg-gray-700"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-white text-lg mb-4 block">What type of support do you need?</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.value}
                        onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                        className={cn(
                          "p-4 rounded-lg border cursor-pointer transition-all",
                          formData.category === category.value
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-gray-700 hover:border-gray-600 bg-gray-900/50"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <h3 className="text-white font-medium">{category.label}</h3>
                            <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white text-lg mb-4 block">Priority Level</Label>
                  <RadioGroup 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {priorityLevels.map((priority) => (
                        <div key={priority.value} className="flex items-start space-x-3">
                          <RadioGroupItem value={priority.value} id={priority.value} className="mt-1" />
                          <Label htmlFor={priority.value} className="flex-1 cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <div className={cn("w-3 h-3 rounded-full", priority.color)} />
                              <div>
                                <div className="text-white font-medium">{priority.label}</div>
                                <div className="text-gray-400 text-sm">{priority.description}</div>
                                <div className="text-orange-400 text-xs mt-1">
                                  Expected response: {getExpectedResponseTime()}
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.category}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Next Step
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="subject" className="text-white">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className="bg-gray-800 border-gray-600 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactMethod" className="text-white">Preferred Contact Method</Label>
                    <Select value={formData.contactMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, contactMethod: value }))}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="chat">Live Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.category === 'urgent' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clientAffected" className="text-white">Client/Deal Affected</Label>
                      <Input
                        id="clientAffected"
                        value={formData.clientAffected}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientAffected: e.target.value }))}
                        placeholder="Client name or deal reference"
                        className="bg-gray-800 border-gray-600 text-white mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dealValue" className="text-white">Potential Deal Value</Label>
                      <Input
                        id="dealValue"
                        value={formData.dealValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, dealValue: e.target.value }))}
                        placeholder="£10,000"
                        className="bg-gray-800 border-gray-600 text-white mt-2"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="description" className="text-white">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please provide as much detail as possible about your issue, including steps to reproduce, error messages, or specific questions..."
                    className="bg-gray-800 border-gray-600 text-white mt-2 min-h-[120px]"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    {formData.description.length}/20 characters minimum
                  </p>
                </div>

                {formData.priority === 'critical' && (
                  <div>
                    <Label htmlFor="urgentReason" className="text-white">Why is this critical? *</Label>
                    <Textarea
                      id="urgentReason"
                      value={formData.urgentReason}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgentReason: e.target.value }))}
                      placeholder="Explain the business impact and timeline..."
                      className="bg-gray-800 border-gray-600 text-white mt-2"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <Button onClick={() => setStep(1)} variant="outline" className="border-gray-600">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.subject || formData.description.length < 20}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Next Step
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-white text-lg mb-4 block">Attachments (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-white mb-2">Click to upload or drag and drop</p>
                      <p className="text-gray-400 text-sm">
                        Supports: PDF, DOC, TXT, Images, ZIP (Max 10MB each)
                      </p>
                    </Label>
                  </div>

                  {attachmentPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {attachmentPreviews.map((attachment, index) => (
                        <div key={index} className="relative bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white text-sm truncate">
                              {attachment.file.name}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {attachment.type === 'image' && attachment.preview ? (
                            <img
                              src={attachment.preview}
                              alt={attachment.file.name}
                              className="w-full h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-16 bg-gray-700 rounded flex items-center justify-center">
                              {attachment.type === 'document' ? (
                                <FileText className="h-8 w-8 text-blue-400" />
                              ) : (
                                <Paperclip className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                          )}
                          <p className="text-gray-400 text-xs mt-1">
                            {(attachment.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="callback"
                      checked={formData.requestCallback}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requestCallback: checked as boolean }))}
                    />
                    <Label htmlFor="callback" className="text-white">
                      Request a callback for this issue
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={formData.anonymousSubmission}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anonymousSubmission: checked as boolean }))}
                    />
                    <Label htmlFor="anonymous" className="text-white">
                      Submit anonymously (for sensitive feedback)
                    </Label>
                  </div>
                </div>

                {/* Ticket Summary */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Ticket Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{categories.find(c => c.value === formData.category)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Priority:</span>
                      <Badge variant="outline" className={cn(
                        "text-white",
                        formData.priority === 'critical' ? 'border-red-500' :
                        formData.priority === 'high' ? 'border-orange-500' :
                        formData.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                      )}>
                        {priorityLevels.find(p => p.value === formData.priority)?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected Response:</span>
                      <span className="text-orange-400">{getExpectedResponseTime()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Attachments:</span>
                      <span className="text-white">{formData.attachments.length} files</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button onClick={() => setStep(2)} variant="outline" className="border-gray-600">
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700 flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Ticket...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Support Ticket
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}