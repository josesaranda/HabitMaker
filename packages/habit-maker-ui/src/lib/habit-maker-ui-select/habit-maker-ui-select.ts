import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { HabitMakerUIOption } from '../habit-maker-ui-option/habit-maker-ui-option';
import { HABIT_MAKER_UI_SELECT_CONTEXT } from './habit-maker-ui-select-context';

let nextSelectId = 0;

@Component({
  selector: 'habit-maker-ui-select',
  standalone: true,
  templateUrl: './habit-maker-ui-select.html',
  styleUrl: './habit-maker-ui-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HabitMakerUISelect),
      multi: true,
    },
    {
      provide: HABIT_MAKER_UI_SELECT_CONTEXT,
      useExisting: forwardRef(() => HabitMakerUISelect),
    },
  ],
  host: {
    class: 'hm-ui-select',
  },
})
export class HabitMakerUISelect implements ControlValueAccessor {
  protected readonly triggerId = `hm-ui-select-${nextSelectId++}`;
  readonly placeholder = input('');
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledBy = input<string | null>(null, {
    alias: 'aria-labelledby',
  });
  readonly ariaDescribedBy = input<string | null>(null, {
    alias: 'aria-describedby',
  });
  readonly ariaInvalid = input<string | boolean | null>(null, {
    alias: 'aria-invalid',
  });
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly selectedValue = signal<string | null>(null);
  readonly activeOptionId = signal<string | null>(null);
  readonly isOpen = signal(false);

  private readonly formDisabled = signal(false);
  private readonly activeIndex = signal(-1);
  private readonly options = contentChildren(HabitMakerUIOption);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly enabledOptions = computed(() =>
    this.options().filter((option) => !option.disabled()),
  );
  private readonly selectedOption = computed(
    () =>
      this.options().find(
        (option) => option.value() === this.selectedValue(),
      ) ?? null,
  );
  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly displayValue = computed(
    () => this.selectedOption()?.displayLabel() || this.placeholder(),
  );
  protected readonly activeOption = computed(
    () => this.enabledOptions()[this.activeIndex()] ?? null,
  );
  protected readonly listboxId = computed(() => `${this.triggerId}-listbox`);

  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private typeaheadBuffer = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  writeValue(value: string | null): void {
    this.selectedValue.set(value == null ? null : String(value));
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) this.close(false);
  }

  selectOption(value: string): void {
    this.optionSelected(value);
  }

  protected onTriggerClick(): void {
    if (this.isDisabled()) return;
    if (this.isOpen()) this.close(true);
    else this.open();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen() ? this.moveActive(1) : this.open();
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.isOpen() ? this.moveActive(-1) : this.openAtEnd();
        return;
      case 'Home':
        if (this.isOpen()) {
          event.preventDefault();
          this.setActiveIndex(0);
        }
        return;
      case 'End':
        if (this.isOpen()) {
          event.preventDefault();
          this.setActiveIndex(this.enabledOptions().length - 1);
        }
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isOpen()) this.open();
        else this.commitActiveOption();
        return;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close(true);
        }
        return;
      case 'Tab':
        if (this.isOpen()) this.close(false);
        return;
      default:
        this.handleTypeahead(event);
    }
  }

  protected onBlur(): void {
    this.close(true);
  }

  protected optionSelected(value: string): void {
    if (this.isDisabled()) return;
    const option = this.enabledOptions().find(
      (candidate) => candidate.value() === value,
    );
    if (!option) return;

    this.selectedValue.set(value);
    this.onChange(value);
    this.onTouched();
    this.close(false);
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocumentPointerDown(event: PointerEvent): void {
    if (
      this.isOpen() &&
      !this.elementRef.nativeElement.contains(event.target as Node)
    ) {
      this.close(true);
    }
  }

  private open(): void {
    if (this.isDisabled() || this.enabledOptions().length === 0) return;
    const selectedIndex = this.enabledOptions().findIndex(
      (option) => option.value() === this.selectedValue(),
    );
    this.setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    this.isOpen.set(true);
  }

  private openAtEnd(): void {
    if (this.isDisabled() || this.enabledOptions().length === 0) return;
    this.setActiveIndex(this.enabledOptions().length - 1);
    this.isOpen.set(true);
  }

  private close(markTouched: boolean): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.activeOptionId.set(null);
      this.activeIndex.set(-1);
    }
    if (markTouched) this.onTouched();
  }

  private moveActive(direction: 1 | -1): void {
    const count = this.enabledOptions().length;
    if (count === 0) return;
    const current = this.activeIndex() < 0 ? 0 : this.activeIndex();
    this.setActiveIndex((current + direction + count) % count);
  }

  private setActiveIndex(index: number): void {
    const options = this.enabledOptions();
    if (options.length === 0) {
      this.activeIndex.set(-1);
      this.activeOptionId.set(null);
      return;
    }
    const boundedIndex = Math.max(0, Math.min(index, options.length - 1));
    this.activeIndex.set(boundedIndex);
    this.activeOptionId.set(options[boundedIndex].id);
  }

  private commitActiveOption(): void {
    const option = this.activeOption();
    if (option) this.optionSelected(option.value());
  }

  private handleTypeahead(event: KeyboardEvent): void {
    if (
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    this.typeaheadBuffer += event.key.toLocaleLowerCase();
    clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => (this.typeaheadBuffer = ''), 500);

    const options = this.enabledOptions();
    if (options.length === 0) return;
    const currentIndex = this.activeIndex() < 0 ? -1 : this.activeIndex();
    const searchOrder = [
      ...options.slice(currentIndex + 1),
      ...options.slice(0, currentIndex + 1),
    ];
    const match = searchOrder.find((option) =>
      option
        .displayLabel()
        .toLocaleLowerCase()
        .startsWith(this.typeaheadBuffer),
    );
    if (!match) return;

    this.setActiveIndex(options.indexOf(match));
    this.isOpen.set(true);
  }
}
