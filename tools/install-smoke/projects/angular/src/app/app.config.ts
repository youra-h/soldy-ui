import { provideBrowserGlobalErrorListeners } from '@angular/core'
import type { ApplicationConfig } from '@angular/core'
import { provideAttrs } from '@soxa-ui/angular'

export const appConfig: ApplicationConfig = {
	providers: [provideBrowserGlobalErrorListeners(), provideAttrs()],
}
