import { provideRouter } from '@angular/router';
import { applicationConfig } from '@storybook/angular';
import type { Preview } from '@storybook/angular';

const preview: Preview = {
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
};

export default preview;
