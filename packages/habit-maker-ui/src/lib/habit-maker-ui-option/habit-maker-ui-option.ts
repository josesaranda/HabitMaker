import {
  AfterContentInit,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { HABIT_MAKER_UI_SELECT_CONTEXT } from '../habit-maker-ui-select/habit-maker-ui-select-context';

let nextOptionId = 0;

@Component({
  selector: 'habit-maker-ui-option',
  standalone: true,
  template: '<ng-content />',
  styleUrl: './habit-maker-ui-option.css',
  host: {
    class: 'hm-ui-option',
    '[id]': 'id',
    role: 'option',
    tabindex: '-1',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.aria-disabled]': 'disabled()',
    '[class.hm-ui-option--selected]': 'isSelected()',
    '[class.hm-ui-option--active]': 'isActive()',
    '[class.hm-ui-option--disabled]': 'disabled()',
    '(click)': 'onClick()',
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class HabitMakerUIOption implements AfterContentInit {
  readonly value = input.required<string>();
  readonly label = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly id = `hm-ui-option-${nextOptionId++}`;

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly select = inject(HABIT_MAKER_UI_SELECT_CONTEXT);
  private readonly contentLabel = signal('');

  readonly displayLabel = computed(
    () => this.label().trim() || this.contentLabel(),
  );
  readonly isSelected = computed(
    () => this.select.selectedValue() === this.value(),
  );
  readonly isActive = computed(() => this.select.activeOptionId() === this.id);

  ngAfterContentInit(): void {
    this.contentLabel.set(
      this.elementRef.nativeElement.textContent?.trim() ?? '',
    );
  }

  onClick(): void {
    if (!this.disabled()) this.select.selectOption(this.value());
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.disabled()) event.preventDefault();
  }
}
