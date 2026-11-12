import { TModalLayoutPlugin } from '../../overlay/modal-layout'
import type { TModalLayoutVariables } from '../../overlay/modal-layout'

export class TAlertDialogLayoutPlugin extends TModalLayoutPlugin {
	protected readonly _variables: TModalLayoutVariables = {
		width: '--so-alert-dialog-width',
		height: '--so-alert-dialog-height',
	}
}
