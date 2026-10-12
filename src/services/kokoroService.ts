// src/services/kokoroService.ts

import { KokoroConfig, TTSState } from '../types';

export class KokoroSpeechService {
  private ttsModel: any = null;
  private state: TTSState = {
    isLoaded: false,
    isLoading: false,
    isPlaying: false,
    progress: 0,
    currentWordIndex: null
  };

  /**
   * Initialise et charge le modèle Kokoro-82M ONNX dans le navigateur
   */
  public async initialize(dtype: 'q8' | 'q4' = 'q8'): Promise<void> {
    if (this.state.isLoaded || this.state.isLoading) return;
    this.state.isLoading = true;

    try {
      const { KokoroTTS } = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js');

      this.ttsModel = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
        dtype: dtype
      });

      this.state.isLoaded = true;
      this.state.isLoading = false;
      console.log('Modèle Kokoro-82M ONNX chargé avec succès.');
    } catch (error) {
      this.state.isLoading = false;
      console.error('Erreur lors du chargement de Kokoro-82M ONNX :', error);
      throw error;
    }
  }

  /**
   * Génère et lit le texte avec la voix française haute fidélité (ff_siwis)
   */
  public async speak(text: string, config: Partial<KokoroConfig> = {}): Promise<void> {
    if (!this.state.isLoaded) {
      await this.initialize(config.dtype || 'q8');
    }

    // Utilisation de la voix française par défaut au lieu d'une voix US
    const voice = config.voice || 'ff_siwis';
    const speed = config.speed || 0.9;

    try {
      this.state.isPlaying = true;

      const result = await this.ttsModel.generate(text, {
        voice: voice,
        speed: speed
      });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = audioCtx.createBuffer(1, result.audio.length, result.sampling_rate);
      buffer.getChannelData(0).set(result.audio);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      source.onended = () => {
        this.state.isPlaying = false;
      };

      source.start(0);
    } catch (error) {
      this.state.isPlaying = false;
      console.warn('Bascule sur la synthèse vocale système (fallback) :', error);
      this.fallbackSpeak(text, speed);
    }
  }

  private fallbackSpeak(text: string, speed: number): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = speed;
      window.speechSynthesis.speak(utterance);
    }
  }

  public getState(): TTSState {
    return { ...this.state };
  }
}

export const kokoroService = new KokoroSpeechService();
