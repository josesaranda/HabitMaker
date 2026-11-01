import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('renders the example link', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[hmLink]');
    const primaryButton = compiled.querySelector('button[hmButton="primary"]');
    const secondaryButton = compiled.querySelector(
      'button[hmButton="secondary"]',
    );

    expect(link?.textContent).toContain('Hello world');
    expect(link?.classList).toContain('hover:text-link-hover');
    expect(primaryButton).not.toBeNull();
    expect(secondaryButton).not.toBeNull();
  });
});
