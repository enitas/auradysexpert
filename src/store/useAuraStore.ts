// src/store/useAuraStore.ts

import { UserPreferences, GamificationState, ReadingSessionMetrics } from '../types';
import { phonologyEngine } from '../core/phonologyEngine';
import { mfmCalculator } from '../core/mfmCalculator';
import { scaffoldingEngine } from '../core/scaffoldingEngine';
import { kokoroService } from '../services/kokoroService';
import { eyeTrackingService } from '../services/eyeTrackingService';

export class AuraStore {
  private preferences: UserPreferences = {
    theme: 'sepia',
    fontDys: false,
    modeExamen: false,
    letterSpacing: 0.05,
    lineHeight: 1.8,
    speechRate: 0.9,
    selectedPhoneme: 'none',
    sylActive: false,
    silentActive: false,
    rulerActive: false,
    gazeTrackingActive: false
  };

  private historyMetrics: ReadingSessionMetrics[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * S'abonner aux changements d'état (Pattern Observer)
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.saveToLocalStorage();
    this.listeners.forEach(listener => listener());
  }

  // --- GESTION DES PRÉFÉRENCES ---
  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(partial: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...partial };
    this.notify();
  }

  // --- ACTIONS IA & VOCAL (KOKORO-82M) ---
  public async speakText(text: string): Promise<void> {
    await kokoroService.speak(text, {
      speed: this.preferences.speechRate
    });
  }

  // --- ACTIONS EYE-TRACKING ---
  public toggleEyeTracking(pointerId: string, containerId: string): boolean {
    const newState = !this.preferences.gazeTrackingActive;
    this.preferences.gazeTrackingActive = newState;

    if (newState) {
      eyeTrackingService.start(pointerId, containerId);
    } else {
      eyeTrackingService.stop();
    }

    this.notify();
    return newState;
  }

  // --- GAMIFICATION & SCAFFOLDING ---
  public getGamificationState(): GamificationState {
    return scaffoldingEngine.getState();
  }

  public awardXP(points: number): { level: number; xp: number; leveledUp: boolean } {
    const result = scaffoldingEngine.addXP(points);
    this.notify();
    return {
      level: result.state.level,
      xp: result.state.xp,
      leveledUp: result.leveledUp
    };
  }

  public registerExerciseAttempt(isSuccess: boolean) {
    const result = scaffoldingEngine.registerAttempt(isSuccess);
    if (isSuccess) {
      this.awardXP(20);
    }
    this.notify();
    return result;
  }

  // --- MÉTRIQUES MFM ---
  public saveSession(totalWords: number, errorsCount: number, durationSeconds: number): ReadingSessionMetrics {
    const session = mfmCalculator.createSessionMetrics(totalWords, errorsCount, durationSeconds);
    this.historyMetrics.push(session);
    this.awardXP(30);
    this.notify();
    return session;
  }

  public getMetricsHistory(): ReadingSessionMetrics[] {
    return [...this.historyMetrics];
  }

  // --- PERSISTANCE ---
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('auradys_preferences', JSON.stringify(this.preferences));
      localStorage.setItem('auradys_metrics', JSON.stringify(this.historyMetrics));
    } catch (e) {
      console.warn('Impossible de sauvegarder dans le LocalStorage :', e);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const savedPref = localStorage.getItem('auradys_preferences');
      if (savedPref) {
        this.preferences = { ...this.preferences, ...JSON.parse(savedPref) };
      }
      const savedMetrics = localStorage.getItem('auradys_metrics');
      if (savedMetrics) {
        this.historyMetrics = JSON.parse(savedMetrics);
      }
    } catch (e) {
      console.warn('Erreur lors de la récupération du LocalStorage :', e);
    }
  }
}

export const auraStore = new AuraStore();
