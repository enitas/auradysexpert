// src/core/phonologyEngine.ts

import { PhonemeTarget } from '../types';

export class PhonologyEngine {
  private static readonly CONFUSIONS: Record<Exclude<PhonemeTarget, 'none'>, RegExp> = {
    bd: /[bd]/gi,
    pq: /[pq]/gi,
    fv: /[fv]/gi,
    an_on_in: /(an|on|in|en|un)/gi
  };

  /**
   * Segmente un texte en syllabes avec alternance de classes CSS (syl-1, syl-2)
   */
  public segmentSyllables(text: string): string {
    if (!text.trim()) return '';

    const words = text.split(/(\s+)/);
    return words
      .map(word => {
        // Ignorer les espaces et mots très courts
        if (/^\s+$/.test(word) || word.length <= 3) return word;

        const syllables = word.match(
          /[^aeiouyyàâéèêëîïôûù]*[aeiouyyàâéèêëîïôûù]+(?:[^aeiouyyàâéèêëîïôûù](?=[^aeiouyyàâéèêëîïôûù][aeiouyyàâéèêëîïôûù])|[^aeiouyyàâéèêëîïôûù]*$)?/gi
        );

        if (!syllables) return word;

        return syllables
          .map((syl, index) => {
            const className = index % 2 === 0 ? 'syl-1' : 'syl-2';
            return `<span class="${className}">${syl}</span>`;
          })
          .join('');
      })
      .join('');
  }

  /**
   * Surligne les phonèmes ou graphèmes cibles responsables de confusions
   */
  public highlightPhonemes(htmlContent: string, target: PhonemeTarget): string {
    if (target === 'none' || !PhonologyEngine.CONFUSIONS[target]) {
      return htmlContent;
    }

    const regex = PhonologyEngine.CONFUSIONS[target];
    return htmlContent.replace(regex, match => `<span class="phoneme-target">${match}</span>`);
  }

  /**
   * Grise les lettres finales muettes pour réduire la surcharge de décodage
   */
  public greySilentLetters(text: string): string {
    return text.replace(/([a-zA-Zàâéèêëîïôûù]+)([e|s|t|d|x|g]$)/gi, (_, p1, p2) => {
      return `${p1}<span class="silent">${p2}</span>`;
    });
  }
}

export const phonologyEngine = new PhonologyEngine();
