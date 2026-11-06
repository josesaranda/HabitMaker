import { TestBed } from '@angular/core/testing';
import { HabitMakerUIBadge } from './habit-maker-ui-badge';

describe('HabitMakerUIBadge', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitMakerUIBadge],
    }).compileComponents();
  });

  it('uses the default variant unless another variant is provided', () => {
    const fixture = TestBed.createComponent(HabitMakerUIBadge);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('hm-badge--default');
  });

  it.each([
    'default',
    'secondary',
    'destructive',
    'outline',
    'ghost',
    'link',
  ] as const)('applies the %s variant class', (variant) => {
    const fixture = TestBed.createComponent(HabitMakerUIBadge);
    fixture.componentRef.setInput('variant', variant);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain(`hm-badge--${variant}`);
  });
});
