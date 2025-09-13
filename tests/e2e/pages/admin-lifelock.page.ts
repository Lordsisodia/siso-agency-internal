import { Page } from '@playwright/test';
import { BasePage } from '../setup';

export class AdminLifeLockPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigation methods
  async navigateToLifeLock() {
    await this.navigateTo('/internal/lifelock');
  }

  async selectTab(tabName: string) {
    await this.page.click(`button:has-text("${tabName}")`);
    await this.page.waitForTimeout(500); // Wait for tab transition
  }

  // Morning Routine methods
  async completeMorningTask(taskName: string) {
    const task = this.page.locator(`text="${taskName}"`).locator('..').locator('input[type="checkbox"]');
    await task.check();
  }

  async setWakeTime(time: string) {
    await this.page.fill('input[type="time"]', time);
  }

  async getMorningProgress() {
    const progressText = await this.page.locator('text=/\\d+%/').first().textContent();
    return progressText ? parseInt(progressText) : 0;
  }

  // Deep Focus Work methods
  async startFocusTimer() {
    await this.page.click('button:has-text("Start")');
  }

  async stopFocusTimer() {
    await this.page.click('button:has-text("Stop")');
  }

  async logFocusSession(task: string, duration: number) {
    await this.page.fill('input[placeholder*="task"], textarea[placeholder*="task"]', task);
    await this.page.fill('input[type="number"], input[placeholder*="duration"]', duration.toString());
    await this.page.click('button:has-text("Log"), button:has-text("Add")');
  }

  async getFocusTime() {
    const timerText = await this.page.locator('[data-testid="timer-display"], text=/\\d+:\\d+/').first().textContent();
    return timerText || '00:00';
  }

  // Light Focus Work methods
  async addLightTask(taskName: string) {
    await this.page.click('button:has-text("Add Task"), button:has-text("New Task")');
    await this.page.fill('input[placeholder*="task"]', taskName);
    await this.page.keyboard.press('Enter');
  }

  async completeLightTask(index: number) {
    const tasks = await this.page.locator('[data-testid*="task"], .task-item').all();
    if (tasks[index]) {
      const checkbox = tasks[index].locator('input[type="checkbox"]');
      await checkbox.check();
    }
  }

  async getLightTaskCount() {
    const tasks = await this.page.locator('[data-testid*="task"], .task-item').all();
    return tasks.length;
  }

  // Home Workout methods
  async logWorkout(workoutData: {
    type?: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
    }>;
  }) {
    if (workoutData.type) {
      await this.page.selectOption('select[name*="workout"]', workoutData.type);
    }

    for (const exercise of workoutData.exercises) {
      await this.page.click('button:has-text("Add Exercise")');
      await this.page.fill('input[placeholder*="exercise"]', exercise.name);
      await this.page.fill('input[placeholder*="sets"], input[name*="sets"]', exercise.sets.toString());
      await this.page.fill('input[placeholder*="reps"], input[name*="reps"]', exercise.reps.toString());
    }

    await this.page.click('button:has-text("Save Workout"), button:has-text("Log Workout")');
  }

  async getWorkoutHistory() {
    const history = await this.page.locator('.workout-history, [data-testid="workout-history"]').all();
    return history.length;
  }

  // Nightly Checkout methods
  async completeNightlyCheckout(data: {
    reflection: string;
    rating: number;
    priorities: string;
  }) {
    await this.page.fill('textarea[placeholder*="reflection"], textarea[name*="reflection"]', data.reflection);
    
    const ratingInput = this.page.locator('input[type="range"], select[name*="rating"]').first();
    const inputType = await ratingInput.getAttribute('type');
    
    if (inputType === 'range') {
      await ratingInput.fill(data.rating.toString());
    } else {
      await ratingInput.selectOption(data.rating.toString());
    }
    
    await this.page.fill('textarea[placeholder*="tomorrow"], textarea[name*="priorities"]', data.priorities);
    await this.page.click('button:has-text("Complete Checkout"), button:has-text("Save")');
  }

  async getTodaysSummary() {
    const summary: Record<string, string> = {};
    
    const accomplishments = await this.page.locator('text=Today\'s Accomplishments').locator('..').textContent();
    if (accomplishments) summary.accomplishments = accomplishments;
    
    const completionRate = await this.page.locator('text=Completion Rate').locator('..').textContent();
    if (completionRate) summary.completionRate = completionRate;
    
    const focusTime = await this.page.locator('text=Focus Time').locator('..').textContent();
    if (focusTime) summary.focusTime = focusTime;
    
    return summary;
  }

  // Utility methods
  async waitForAutoSave() {
    // Wait for auto-save indicator or toast
    await this.page.waitForSelector('text=Saved, text=Auto-saved', { 
      state: 'visible',
      timeout: 5000 
    }).catch(() => {
      // Auto-save might not show a message
    });
  }

  async getActiveTab() {
    const activeTab = await this.page.locator('button[aria-selected="true"], button.active').first();
    return await activeTab.textContent();
  }

  async isTabContentLoaded(tabName: string) {
    const contentSelectors = {
      'Morning Routine': 'h2:has-text("Morning Routine")',
      'Deep Focus Work': 'h2:has-text("Deep Focus")',
      'Light Focus Work': 'h2:has-text("Light Focus")',
      'Home Workout': 'h2:has-text("Home Workout")',
      'Nightly Checkout': 'h2:has-text("Nightly Checkout")'
    };
    
    const selector = contentSelectors[tabName as keyof typeof contentSelectors];
    if (selector) {
      return await this.page.locator(selector).isVisible();
    }
    return false;
  }

  async getValidationErrors() {
    const errors = await this.page.locator('.error-message, [role="alert"]').all();
    const errorTexts = [];
    
    for (const error of errors) {
      const text = await error.textContent();
      if (text) errorTexts.push(text);
    }
    
    return errorTexts;
  }

  async clearAllData() {
    // Clear local storage and session storage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}