import {
  Component,
  computed,
  contentChild,
  inject,
  input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitMakerUIButton } from '../habit-maker-ui-button/habit-maker-ui-button';
import { HabitMakerUIButtonIcon } from '../habit-maker-ui-button-icon/habit-maker-ui-button-icon';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';
import { HabitMakerUIHeaderPortalService } from './habit-maker-ui-header-portal.service';

@Component({
  selector: 'habit-maker-ui-header',
  standalone: true,
  imports: [HabitMakerUIIcon, RouterLink],
  templateUrl: './habit-maker-ui-header.html',
  styleUrl: './habit-maker-ui-header.css',
})
export class HabitMakerUIHeader implements OnInit, OnDestroy {
  private readonly headerPortal = inject(HabitMakerUIHeaderPortalService);
  private readonly button = contentChild(HabitMakerUIButton);
  private readonly buttonIcon = contentChild(HabitMakerUIButtonIcon);

  @ViewChild('headerContent', { static: true })
  private headerContent!: TemplateRef<unknown>;

  backNavigation = input<string | undefined>();
  backLabel = input('Back to previous page');
  backTitle = input('Back');
  titleId = input<string | undefined>();

  protected readonly hasActions = computed(
    () => this.button() !== undefined || this.buttonIcon() !== undefined,
  );

  ngOnInit(): void {
    this.headerPortal.setTemplate(this.headerContent);
  }

  ngOnDestroy(): void {
    this.headerPortal.clearTemplate(this.headerContent);
  }
}
