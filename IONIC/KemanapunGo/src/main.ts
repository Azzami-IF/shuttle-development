import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// Trigger rebuild to fix server sync issues
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
