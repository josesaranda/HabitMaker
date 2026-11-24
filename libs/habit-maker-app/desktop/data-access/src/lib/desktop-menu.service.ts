import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '@habit-maker/auth-data-access';
import { LanguageService } from '@habit-maker/i18n-data-access';
import { isDesktopApp } from '@habit-maker/shared-data-access';

@Injectable({ providedIn: 'root' })
export class DesktopMenuService {
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService, {
    optional: true,
  });
  private readonly document = inject(DOCUMENT);

  readonly connectRequested = signal(0);

  async setup(): Promise<void> {
    if (!isDesktopApp()) return;

    try {
      const menuModule = await import('@tauri-apps/api/menu');
      const Menu = menuModule.Menu;
      const Submenu = menuModule.Submenu;

      const menu = await Menu.default();
      const items = await menu.items();

      const target = Submenu
        ? (items.find((item) => item instanceof Submenu) as
            { prepend: (item: unknown) => Promise<void> } | undefined)
        : undefined;

      const label = this.connectToServerLabel();

      if (target) {
        await target.prepend({
          id: 'connect-to-server',
          text: label,
          action: () => this.requestConnectToServer(),
        });
      } else {
        await menu.append({
          text: this.menuTitle(),
          items: [
            {
              id: 'connect-to-server',
              text: label,
              action: () => this.requestConnectToServer(),
            },
          ],
        });
      }

      await this.localizeMenu(menu);

      try {
        await menu.setAsAppMenu();
      } catch {
        // The app-wide menu is only supported on some platforms.
      }

      try {
        await menu.setAsWindowMenu();
      } catch {
        // The window menu is only supported on some platforms.
      }
    } catch {
      // Ignore menu setup failures outside the desktop runtime.
    }
  }

  connectToServer(): void {
    if (this.authService.authenticated()) {
      this.authService.logout();
    }

    this.connectRequested.update((value) => value + 1);
  }

  requestConnectToServer(): void {
    this.connectToServer();
  }

  private currentLanguage(): string {
    if (this.languageService) return this.languageService.language();
    return this.detectLanguage();
  }

  private connectToServerLabel(): string {
    return this.currentLanguage() === 'es'
      ? 'Conectar a un servidor'
      : 'Connect to a server';
  }

  private menuTitle(): string {
    return this.currentLanguage() === 'es' ? 'Servidor' : 'Server';
  }

  private async localizeMenu(menu: any): Promise<void> {
    if (this.currentLanguage() !== 'es') return;

    const { Submenu } = await import('@tauri-apps/api/menu');
    const items = await menu.items();
    for (const item of items) {
      if (item instanceof Submenu) {
        const text = await item.text();
        const translated = this.translateLabel(text);
        if (translated !== text) await item.setText(translated);
        await this.localizeSubmenu(item);
      } else {
        const text = await item.text();
        const translated = this.translateLabel(text);
        if (translated !== text) await item.setText(translated);
      }
    }
  }

  private async localizeSubmenu(submenu: any): Promise<void> {
    const items = await submenu.items();
    for (const item of items) {
      const Submenu = (await import('@tauri-apps/api/menu')).Submenu;
      if (item instanceof Submenu) {
        const text = await item.text();
        const translated = this.translateLabel(text);
        if (translated !== text) await item.setText(translated);
        await this.localizeSubmenu(item);
      } else {
        const text = await item.text();
        const translated = this.translateLabel(text);
        if (translated !== text) await item.setText(translated);
      }
    }
  }

  private translateLabel(text: string): string {
    const labels: Record<string, string> = {
      Window: 'Ventana',
      Help: 'Ayuda',
      File: 'Archivo',
      Edit: 'Editar',
      View: 'Ver',
      Services: 'Servicios',
      'Hide Others': 'Ocultar otros',
      'Show All': 'Mostrar todo',
      'Close Window': 'Cerrar ventana',
      Undo: 'Deshacer',
      Redo: 'Rehacer',
      Cut: 'Cortar',
      Copy: 'Copiar',
      Paste: 'Pegar',
      'Select All': 'Seleccionar todo',
      Minimize: 'Minimizar',
      Maximize: 'Maximizar',
      Fullscreen: 'Pantalla completa',
    };

    if (labels[text]) return labels[text];
    if (text.startsWith('About ')) {
      return `Acerca de ${text.slice('About '.length)}`;
    }
    if (text.startsWith('Hide ')) {
      return `Ocultar ${text.slice('Hide '.length)}`;
    }
    if (text.startsWith('Quit ')) {
      return `Salir de ${text.slice('Quit '.length)}`;
    }
    if (text === 'Quit') return 'Salir';
    if (text === 'Hide') return 'Ocultar';
    if (text === 'About') return 'Acerca de';
    return text;
  }

  private detectLanguage(): string {
    const navigator = this.document.defaultView?.navigator;
    const browserLanguages = navigator?.languages?.length
      ? navigator.languages
      : [navigator?.language ?? ''];
    const first = browserLanguages[0]?.toLowerCase().split(/[-_]/, 1)[0];
    return first === 'es' ? 'es' : 'en';
  }
}
