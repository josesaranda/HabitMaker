import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  DestroyRef,
  inject,
  Injectable,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first, interval } from 'rxjs';

const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

export type AppUpdateCheckResult =
  | 'update-available'
  | 'up-to-date'
  | 'unavailable'
  | 'error';

@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly swUpdate = inject(SwUpdate, { optional: true });
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private applyingUpdate = false;

  constructor() {
    if (!this.swUpdate?.isEnabled) return;

    this.swUpdate.versionUpdates
      .pipe(
        filter(
          (event): event is VersionReadyEvent =>
            event.type === 'VERSION_READY',
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.applyUpdate());

    this.appRef.isStable
      .pipe(
        first((isStable) => isStable),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.checkForUpdateAutomatically();

        interval(UPDATE_CHECK_INTERVAL_MS)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.checkForUpdateAutomatically());
      });
  }

  async checkForUpdates(): Promise<AppUpdateCheckResult> {
    if (!this.swUpdate?.isEnabled) return 'unavailable';

    try {
      const updateAvailable = await this.swUpdate.checkForUpdate();
      return updateAvailable ? 'update-available' : 'up-to-date';
    } catch {
      return 'error';
    }
  }

  private checkForUpdateAutomatically(): void {
    void this.checkForUpdates();
  }

  private applyUpdate(): void {
    if (this.applyingUpdate || !this.swUpdate) return;
    this.applyingUpdate = true;

    void this.swUpdate
      .activateUpdate()
      .then(() => this.document.defaultView?.location.reload())
      .catch(() => {
        this.applyingUpdate = false;
      });
  }
}
