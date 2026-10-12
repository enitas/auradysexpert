// src/core/mfmCalculator.ts

import { ReadingSessionMetrics } from '../types';

export class MFMCalculator {
  /**
   * Calcule le score MFM (Mots Fortement Maîtrisés par minute)
   * Formule clinique : MFM = (Mots lus - Erreurs) / (Temps en secondes / 60)
   */
  public calculateMFM(totalWords: number, errorsCount: number, durationSeconds: number): number {
    if (durationSeconds <= 0) return 0;
    const correctWords = Math.max(0, totalWords - errorsCount);
    const minutes = durationSeconds / 60;
    return Math.round(correctWords / minutes);
  }

  /**
   * Calcule le taux de précision de lecture en pourcentage
   */
  public calculatePrecisionRate(totalWords: number, errorsCount: number): number {
    if (totalWords <= 0) return 0;
    const correctWords = Math.max(0, totalWords - errorsCount);
    return Math.round((correctWords / totalWords) * 100);
  }

  /**
   * Génère un rapport de session complet pour le bilan orthophonique
   */
  public createSessionMetrics(
    totalWords: number,
    errorsCount: number,
    durationSeconds: number
  ): ReadingSessionMetrics {
    const mfm = this.calculateMFM(totalWords, errorsCount, durationSeconds);
    const precision = this.calculatePrecisionRate(totalWords, errorsCount);

    return {
      sessionId: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      totalWords,
      durationSeconds,
      errorsCount,
      motsFortementMaitrises: mfm,
      precisionRate: precision
    };
  }
}

export const mfmCalculator = new MFMCalculator();
