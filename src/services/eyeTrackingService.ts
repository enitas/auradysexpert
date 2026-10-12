// src/services/eyeTrackingService.ts

export interface EyeTrackingConfig {
  scrollSensitivity: number; // Sensibilité du défilement
  pointerColor: string;
}

export class EyeTrackingService {
  private isActive: boolean = false;
  private pointerElement: HTMLElement | null = null;
  private scrollContainer: HTMLElement | null = null;

  /**
   * Active le pointeur visuel et le suivi du regard/curseur
   */
  public start(pointerId: string, targetContainerId: string): void {
    this.pointerElement = document.getElementById(pointerId);
    this.scrollContainer = document.getElementById(targetContainerId);

    if (!this.pointerElement) {
      console.warn(`Élément pointeur avec l'ID "${pointerId}" introuvable.`);
      return;
    }

    this.isActive = true;
    this.pointerElement.style.display = 'block';
    this.attachEvents();
    console.log('Service Eye-Tracking initialisé.');
  }

  /**
   * Arrête le suivi du regard
   */
  public stop(): void {
    this.isActive = false;
    if (this.pointerElement) {
      this.pointerElement.style.display = 'none';
    }
    this.detachEvents();
  }

  /**
   * Met à jour la position du point de fixation (X, Y)
   */
  public updateGazePosition(x: number, y: number): void {
    if (!this.isActive || !this.pointerElement) return;

    this.pointerElement.style.left = `${x}px`;
    this.pointerElement.style.top = `${y}px`;

    // Gestion du défilement automatique par le regard
    if (this.scrollContainer) {
      const rect = this.scrollContainer.getBoundingClientRect();
      const bottomThreshold = rect.bottom - 80;

      if (y > bottomThreshold && y < rect.bottom + 50) {
        this.scrollContainer.scrollTop += 3;
      } else if (y < rect.top + 80 && y > rect.top - 50) {
        this.scrollContainer.scrollTop -= 3;
      }
    }
  }

  private handleMouseMove = (event: MouseEvent): void => {
    this.updateGazePosition(event.clientX, event.clientY);
  };

  private attachEvents(): void {
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  private detachEvents(): void {
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  public getIsActive(): boolean {
    return this.isActive;
  }
}

export const eyeTrackingService = new EyeTrackingService();
