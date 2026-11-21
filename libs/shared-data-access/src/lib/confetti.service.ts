import { Injectable } from '@angular/core';
import confetti from '@hiseb/confetti';

@Injectable({ providedIn: 'root' })
export class ConfettiService {
  launch(): void {
    const width = window.innerWidth || 1024;
    const launchPoints = [0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9].map((fraction) =>
      Math.round(width * fraction),
    );

    launchPoints.forEach((x, index) => {
      setTimeout(() => {
        confetti({
          position: { x, y: 0 },
          count: 140,
          size: 1.1,
          velocity: 220,
        });
      }, index * 120);
    });
  }
}
