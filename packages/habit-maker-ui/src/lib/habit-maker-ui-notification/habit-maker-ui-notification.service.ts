import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
  inject,
} from '@angular/core';
import {
  HabitMakerUINotification,
  type HabitMakerUINotificationOptions,
  type HabitMakerUINotificationPosition,
  type HabitMakerUINotificationType,
} from './habit-maker-ui-notification';

@Injectable({ providedIn: 'root' })
export class HabitMakerUINotificationService {
  constructor(
    private readonly appRef: ApplicationRef = inject(ApplicationRef),
    private readonly injector: EnvironmentInjector = inject(
      EnvironmentInjector,
    ),
  ) {}

  create(
    options: HabitMakerUINotificationOptions = {},
  ): HabitMakerUINotification {
    const normalizedType = normalizeType(options.type ?? 'default');
    const label = options.label ?? '';
    const content =
      options.content ?? options.message ?? options.text ?? options.body ?? '';
    const position = normalizePosition(options.position ?? 'top-right');
    const duration = normalizeDuration(options.duration ?? 3000);

    const projectableNodes = content
      ? [[document.createTextNode(content)]]
      : undefined;

    const componentRef = createComponent(HabitMakerUINotification, {
      environmentInjector: this.injector,
      projectableNodes,
    });

    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild(componentRef.location.nativeElement);

    componentRef.setInput('type', normalizedType);
    componentRef.setInput('label', label);
    componentRef.setInput('position', position);
    componentRef.setInput('duration', duration);

    componentRef.changeDetectorRef.detectChanges();

    const instance = componentRef.instance;
    const dialog = componentRef.location.nativeElement.querySelector(
      'dialog',
    ) as HTMLDialogElement | null;
    if (dialog) {
      (instance as any).dialog = dialog;
      (instance as any).element = dialog;
    }
    (instance as any).destroy = () => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    };

    return instance;
  }
}

function normalizeType(value: string): HabitMakerUINotificationType {
  switch (value) {
    case 'success':
    case 'warning':
    case 'info':
    case 'danger':
      return value;
    default:
      return 'default';
  }
}

function normalizePosition(value: string): HabitMakerUINotificationPosition {
  switch (value) {
    case 'top-left':
    case 'top-right':
    case 'top-center':
    case 'bottom-left':
    case 'bottom-right':
    case 'bottom-center':
      return value;
    default:
      return 'top-right';
  }
}

function normalizeDuration(value: number | string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3000;
}
