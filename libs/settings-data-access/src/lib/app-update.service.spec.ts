import { ApplicationRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { of, Subject } from 'rxjs';
import { AppUpdateService } from './app-update.service';

describe('AppUpdateService', () => {
  let versionUpdates: Subject<VersionEvent>;
  let checkForUpdate: ReturnType<typeof vi.fn>;
  let activateUpdate: ReturnType<typeof vi.fn>;
  let reload: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    versionUpdates = new Subject<VersionEvent>();
    checkForUpdate = vi.fn().mockResolvedValue(false);
    activateUpdate = vi.fn().mockResolvedValue(undefined);
    reload = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates: versionUpdates.asObservable(),
            checkForUpdate,
            activateUpdate,
          },
        },
        {
          provide: ApplicationRef,
          useValue: { isStable: of(true) },
        },
        {
          provide: DOCUMENT,
          useValue: { defaultView: { location: { reload } } },
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('checks for an update when the application becomes stable', () => {
    TestBed.inject(AppUpdateService);

    expect(checkForUpdate).toHaveBeenCalledOnce();
  });

  it('activates a ready version and reloads the page', async () => {
    TestBed.inject(AppUpdateService);

    versionUpdates.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'old-version' },
      latestVersion: { hash: 'new-version' },
    });
    await Promise.resolve();

    expect(activateUpdate).toHaveBeenCalledOnce();
    expect(reload).toHaveBeenCalledOnce();
  });
});
