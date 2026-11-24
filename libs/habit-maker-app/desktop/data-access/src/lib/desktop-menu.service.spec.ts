import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@habit-maker/auth-data-access';
import { DesktopMenuService } from './desktop-menu.service';

describe('DesktopMenuService', () => {
  let service: DesktopMenuService;
  let authenticated: ReturnType<typeof vi.fn>;
  let logout: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    authenticated = vi.fn().mockReturnValue(false);
    logout = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticated,
            logout,
          },
        },
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: { navigator: { language: 'en', languages: ['en'] } },
          },
        },
      ],
    });

    service = TestBed.inject(DesktopMenuService);
  });

  it('increments connectRequested when requesting a connection', () => {
    expect(service.connectRequested()).toBe(0);

    service.requestConnectToServer();

    expect(service.connectRequested()).toBe(1);
  });

  it('logs out before requesting a connection when authenticated', () => {
    authenticated.mockReturnValue(true);

    service.connectToServer();

    expect(logout).toHaveBeenCalledOnce();
    expect(service.connectRequested()).toBe(1);
  });
});
