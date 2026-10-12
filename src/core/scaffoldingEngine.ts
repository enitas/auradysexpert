// src/core/scaffoldingEngine.ts

import { GamificationState } from '../types';

export class ScaffoldingEngine {
  private state: GamificationState = {
    xp: 0,
    level: 1,
    badges: [],
    streakDays: 1,
    scaffoldingLevel: 1 // 1: Minimal, 2: Indice visuel, 3: Guidage complet
  };

  /**
   * Calcule et ajoute de l'XP à l'élève selon l'activité réussie
   */
  public addXP(points: number): { state: GamificationState; leveledUp: boolean } {
    this.state.xp += points;
    const requiredXPForNextLevel = this.state.level * 100;

    let leveledUp = false;
    if (this.state.xp >= requiredXPForNextLevel) {
      this.state.level++;
      leveledUp = true;
      this.checkLevelBadges();
    }

    return { state: { ...this.state }, leveledUp };
  }

  /**
   * Analyse la performance dans un exercice et ajuste le niveau de guidage visuel
   */
  public registerAttempt(isSuccess: boolean): { scaffoldingLevel: number; hintNeeded: boolean } {
    if (isSuccess) {
      // Réussite : on réduit progressivement les aides pour autonomiser l'élève
      this.state.scaffoldingLevel = Math.max(1, this.state.scaffoldingLevel - 1);
      return { scaffoldingLevel: this.state.scaffoldingLevel, hintNeeded: false };
    } else {
      // Échec/Hésitation : activation d'indices visuels supplémentaires (scaffolding)
      this.state.scaffoldingLevel = Math.min(3, this.state.scaffoldingLevel + 1);
      return { scaffoldingLevel: this.state.scaffoldingLevel, hintNeeded: true };
    }
  }

  /**
   * Vérifie et attribue des badges cliniques selon la progression
   */
  private checkLevelBadges(): void {
    const badgeKey = `level_${this.state.level}`;
    if (!this.state.badges.includes(badgeKey)) {
      this.state.badges.push(badgeKey);
    }
  }

  public getState(): GamificationState {
    return { ...this.state };
  }
}

export const scaffoldingEngine = new ScaffoldingEngine();
