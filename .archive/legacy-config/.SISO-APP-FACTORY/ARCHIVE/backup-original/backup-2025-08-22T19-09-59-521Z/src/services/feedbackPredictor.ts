/**
 * Feedback Prediction System
 * Analyzes patterns in user feedback to predict other likely issues
 */

interface KnownIssue {
  id: string;
  title: string;
  category: 'mobile' | 'database' | 'ui' | 'time' | 'pwa' | 'state';
  severity: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  symptom: string;
}

interface PredictedIssue {
  id: string;
  title: string;
  category: 'mobile' | 'database' | 'ui' | 'time' | 'pwa' | 'state';
  severity: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  predictedSymptom: string;
  confidence: number; // 0-100
  reasoning: string;
  testSteps: string[];
}

export class FeedbackPredictor {
  private knownIssues: KnownIssue[] = [];
  
  /**
   * Add known issues from user feedback
   */
  addKnownIssue(issue: KnownIssue) {
    this.knownIssues.push(issue);
  }
  
  /**
   * Predict likely issues based on patterns
   */
  predictIssues(): PredictedIssue[] {
    const predictions: PredictedIssue[] = [];
    
    // Pattern 1: Mobile touch interaction issues
    const mobileIssues = this.knownIssues.filter(issue => 
      issue.category === 'mobile' && issue.symptom.includes('click')
    );
    
    if (mobileIssues.length >= 2) {
      // Predict other sections have same issue
      const affectedSections = ['deep-focus', 'health-tracking', 'nightly-checkout'];
      
      affectedSections.forEach(section => {
        if (!this.knownIssues.some(issue => issue.component === section)) {
          predictions.push({
            id: `predicted-mobile-${section}`,
            title: `${section} section non-interactive on mobile`,
            category: 'mobile',
            severity: 'high',
            component: section,
            predictedSymptom: 'Touch events not firing, inputs unresponsive, form submission broken',
            confidence: 85,
            reasoning: 'Pattern detected: Multiple sections have same mobile touch interaction failures',
            testSteps: [
              `Open ${section} section on mobile device`,
              'Try to tap/click interactive elements',
              'Attempt to input data in form fields',
              'Try to submit or save data',
              'Verify touch events are registering'
            ]
          });
        }
      });
    }
    
    // Pattern 2: Database persistence issues
    const dbIssues = this.knownIssues.filter(issue => 
      issue.category === 'database' || issue.symptom.includes('save')
    );
    
    if (dbIssues.length >= 1) {
      const dataTypes = ['voice-commands', 'focus-sessions', 'user-preferences', 'streak-data'];
      
      dataTypes.forEach(dataType => {
        predictions.push({
          id: `predicted-db-${dataType}`,
          title: `${dataType} not persisting to database`,
          category: 'database',
          severity: 'critical',
          component: dataType,
          predictedSymptom: 'Data created but disappears on page refresh/app reopen',
          confidence: 75,
          reasoning: 'Database persistence issues detected - likely affects related data types',
          testSteps: [
            `Create ${dataType} data`,
            'Save/submit the data',
            'Refresh the page/reopen app',
            'Verify data still exists',
            'Check browser dev tools for API errors'
          ]
        });
      });
    }
    
    // Pattern 3: Time/Date formatting issues
    const timeIssues = this.knownIssues.filter(issue => 
      issue.symptom.includes('time') || issue.symptom.includes('AM') || issue.symptom.includes('PM')
    );
    
    if (timeIssues.length >= 1) {
      const timeComponents = ['focus-session-times', 'task-deadlines', 'weekly-navigation'];
      
      timeComponents.forEach(component => {
        predictions.push({
          id: `predicted-time-${component}`,
          title: `${component} showing incorrect AM/PM times`,
          category: 'time',
          severity: 'medium',
          component: component,
          predictedSymptom: '24-hour backend time incorrectly converted to 12-hour display format',
          confidence: 70,
          reasoning: 'Time format conversion bug pattern - likely affects all datetime displays',
          testSteps: [
            `Navigate to ${component} section`,
            'Check all displayed times',
            'Verify AM/PM shows correctly for afternoon/evening times',
            'Test with different time ranges (morning, afternoon, evening)',
            'Compare with backend stored values'
          ]
        });
      });
    }
    
    // Pattern 4: Component state loss
    const stateIssues = this.knownIssues.filter(issue => 
      issue.symptom.includes('disappeared') || issue.symptom.includes('missing')
    );
    
    if (stateIssues.length >= 1) {
      const stateComponents = ['user-settings', 'navigation-state', 'form-draft-data'];
      
      stateComponents.forEach(component => {
        predictions.push({
          id: `predicted-state-${component}`,
          title: `${component} not maintaining state correctly`,
          category: 'state',
          severity: 'medium',
          component: component,
          predictedSymptom: 'Component state resets unexpectedly, losing user context',
          confidence: 60,
          reasoning: 'Component state loss detected - likely affects other stateful components',
          testSteps: [
            `Interact with ${component}`,
            'Navigate away and back',
            'Refresh the page',
            'Check if state is maintained',
            'Test across mobile/desktop'
          ]
        });
      });
    }
    
    // Pattern 5: PWA-specific issues (when mobile issues are widespread)
    if (mobileIssues.length >= 3) {
      const pwaFeatures = ['offline-functionality', 'push-notifications', 'install-prompt'];
      
      pwaFeatures.forEach(feature => {
        predictions.push({
          id: `predicted-pwa-${feature}`,
          title: `PWA ${feature} not working on mobile`,
          category: 'pwa',
          severity: feature === 'offline-functionality' ? 'high' : 'medium',
          component: feature,
          predictedSymptom: 'PWA-specific functionality broken or inconsistent with native app behavior',
          confidence: 65,
          reasoning: 'Widespread mobile issues suggest PWA implementation problems',
          testSteps: [
            'Test in PWA mode (installed to home screen)',
            `Verify ${feature} works as expected`,
            'Compare behavior to mobile browser',
            'Test offline scenarios if applicable',
            'Check service worker and manifest issues'
          ]
        });
      });
    }
    
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Load known issues from logged feedback
   */
  loadFromFeedback() {
    // Known issues from 2025-01-09 feedback
    this.addKnownIssue({
      id: '1',
      title: 'Tasks not saving to database',
      category: 'database',
      severity: 'critical',
      component: 'task-creation',
      symptom: 'Tasks created but disappear on page refresh'
    });
    
    this.addKnownIssue({
      id: '2',
      title: 'Light Focus Work not clickable on mobile',
      category: 'mobile',
      severity: 'high', 
      component: 'light-focus',
      symptom: 'Can\'t click, touch events not firing, inputs unresponsive'
    });
    
    this.addKnownIssue({
      id: '3',
      title: 'Workout objectives not interactive on mobile',
      category: 'mobile',
      severity: 'high',
      component: 'workout-objectives',
      symptom: 'Can\'t click or enter data, form submission broken'
    });
    
    this.addKnownIssue({
      id: '4',
      title: 'Wake up time shows 6 PM as 6 AM',
      category: 'time',
      severity: 'medium',
      component: 'wake-time-display',
      symptom: '24-hour backend time incorrectly displayed in 12-hour format'
    });
    
    this.addKnownIssue({
      id: '5',
      title: 'Morning routine missing day selector',
      category: 'state',
      severity: 'medium',
      component: 'morning-routine',
      symptom: 'Day context disappeared, missing UI component'
    });
  }
  
  /**
   * Generate testing checklist for predictions
   */
  generateTestingChecklist(predictions: PredictedIssue[]): string[] {
    const checklist: string[] = [];
    
    predictions.forEach(prediction => {
      checklist.push(`\n## ${prediction.title} (${prediction.confidence}% confidence)`);
      prediction.testSteps.forEach(step => {
        checklist.push(`- [ ] ${step}`);
      });
    });
    
    return checklist;
  }
}

// Create singleton instance
export const feedbackPredictor = new FeedbackPredictor();