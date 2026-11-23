import { TestBed } from '@angular/core/testing';
import { provideTranslocoTesting } from '@habit-maker/test-support';
import { DESKTOP_API_URL_STORAGE_KEY } from '@habit-maker/shared-data-access';
import { DesktopSetup } from './desktop-setup';

describe('DesktopSetup', () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.restoreAllMocks();
    await TestBed.configureTestingModule({
      imports: [DesktopSetup],
      providers: [provideTranslocoTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves the normalized API URL after a successful health check', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
      );
    const fixture = TestBed.createComponent(DesktopSetup);
    const configured = vi.fn();
    fixture.componentInstance.configured.subscribe(configured);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const input = compiled.querySelector<HTMLInputElement>('#desktop-api-url');
    input!.value = 'https://habits.example.com/';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    compiled
      .querySelector('form')!
      .dispatchEvent(
        new SubmitEvent('submit', { bubbles: true, cancelable: true }),
      );
    await fixture.whenStable();

    expect(fetch).toHaveBeenCalledWith(
      'https://habits.example.com/api/health',
      expect.anything(),
    );
    expect(configured).toHaveBeenCalledOnce();
    expect(localStorage.getItem(DESKTOP_API_URL_STORAGE_KEY)).toBe(
      'https://habits.example.com/api',
    );
  });

  it('shows an invalid URL error without calling the API', () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    const fixture = TestBed.createComponent(DesktopSetup);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const input = compiled.querySelector<HTMLInputElement>('#desktop-api-url');
    input!.value = 'habits.example.com';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    compiled
      .querySelector('form')!
      .dispatchEvent(
        new SubmitEvent('submit', { bubbles: true, cancelable: true }),
      );
    fixture.detectChanges();

    expect(fetch).not.toHaveBeenCalled();
    expect(compiled.textContent).toContain(
      'Introduce una URL http o https válida.',
    );
    expect(localStorage.getItem(DESKTOP_API_URL_STORAGE_KEY)).toBeNull();
  });

  it('does not save the URL when the API is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    const fixture = TestBed.createComponent(DesktopSetup);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    compiled
      .querySelector('form')!
      .dispatchEvent(
        new SubmitEvent('submit', { bubbles: true, cancelable: true }),
      );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain(
      'No se pudo conectar con la API de HabitMaker',
    );
    expect(localStorage.getItem(DESKTOP_API_URL_STORAGE_KEY)).toBeNull();
  });
});
