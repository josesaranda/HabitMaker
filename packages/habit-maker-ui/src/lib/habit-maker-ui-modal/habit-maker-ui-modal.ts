import { Component, ElementRef, input, viewChild } from '@angular/core';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

const MODAL_TRANSITION_DURATION = 240;
const MODAL_TRANSITION_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

@Component({
  selector: 'hm-modal',
  imports: [HabitMakerUIIcon],
  templateUrl: './habit-maker-ui-modal.html',
  styleUrl: './habit-maker-ui-modal.css',
})
export class HabitMakerUIModal {
  label = input.required<string>();
  closeLabel = input('Close dialog');

  private readonly dialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private triggerElement: HTMLElement | null = null;
  private activeAnimation: Animation | null = null;
  private originScale = { x: 0.92, y: 0.92 };

  /** Opens the modal and animates it from the element that invoked it. */
  openFrom(trigger: HTMLElement): void {
    const dialog = this.dialogRef().nativeElement;
    if (dialog.open) return;

    this.triggerElement = trigger;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    const dialogRect = dialog.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    this.originScale = {
      x: this.getScale(triggerRect.width, dialogRect.width),
      y: this.getScale(triggerRect.height, dialogRect.height),
    };
    dialog.style.transformOrigin = `${triggerRect.left + triggerRect.width / 2 - dialogRect.left}px ${triggerRect.top + triggerRect.height / 2 - dialogRect.top}px`;

    this.playAnimation(dialog, [
      {
        transform: `scale(${this.originScale.x}, ${this.originScale.y})`,
        opacity: 0,
      },
      { transform: 'scale(1, 1)', opacity: 1 },
    ]);
  }

  /** Closes the modal and returns focus to the element that opened it. */
  close(): void {
    const dialog = this.dialogRef().nativeElement;
    if (!dialog.open) return;

    const currentStyle = getComputedStyle(dialog);
    const currentTransform =
      currentStyle.transform === 'none'
        ? 'scale(1, 1)'
        : currentStyle.transform;
    const currentOpacity = currentStyle.opacity;

    this.activeAnimation?.cancel();
    this.activeAnimation = null;
    dialog.setAttribute('data-closing', '');

    this.playAnimation(
      dialog,
      [
        { transform: currentTransform, opacity: currentOpacity },
        {
          transform: `scale(${this.originScale.x}, ${this.originScale.y})`,
          opacity: 0,
        },
      ],
      () => this.finishClose(dialog),
    );
  }

  protected onCancel(event: Event): void {
    // Keep Escape dismissal animated rather than letting the browser close instantly.
    event.preventDefault();
    this.close();
  }

  protected onDialogClick(event: MouseEvent): void {
    // A click whose target is the dialog itself came from its native backdrop.
    if (event.target === event.currentTarget) this.close();
  }

  private playAnimation(
    dialog: HTMLDialogElement,
    keyframes: Keyframe[],
    onFinish?: () => void,
  ): void {
    const reducedMotion =
      typeof window === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || typeof dialog.animate !== 'function') {
      onFinish?.();
      return;
    }

    const animation = dialog.animate(keyframes, {
      duration: MODAL_TRANSITION_DURATION,
      easing: MODAL_TRANSITION_EASING,
      fill: 'both',
    });
    this.activeAnimation = animation;
    void animation.finished
      .then(() => {
        if (this.activeAnimation === animation) this.activeAnimation = null;
        animation.cancel();
        onFinish?.();
      })
      .catch(() => {
        // Cancelling a previous animation is expected when closing during entry.
      });
  }

  private finishClose(dialog: HTMLDialogElement): void {
    dialog.removeAttribute('data-closing');
    if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }

    const trigger = this.triggerElement;
    this.triggerElement = null;
    if (trigger?.isConnected && !trigger.hasAttribute('disabled'))
      trigger.focus();
  }

  private getScale(sourceSize: number, targetSize: number): number {
    if (sourceSize <= 0 || targetSize <= 0) return 0.92;
    return Math.min(sourceSize / targetSize, 1);
  }
}
