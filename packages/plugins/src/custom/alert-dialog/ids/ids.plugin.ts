import type { IAlertDialog } from '@soxa-ui/core'
import type { IPluginContext } from '../../../base'
import { TModalIdsPlugin } from '../../overlay/modal-ids'

/** Both sides of the description reference share the mount's stable id. */
export class TAlertDialogIdsPlugin extends TModalIdsPlugin {
	override install(ctx: IPluginContext): void {
		super.install(ctx)

		const owner = ctx.getInstance<IAlertDialog>()

		if (!owner) return

		const bodyId = ctx.createId('body')

		owner.bodyAria.add('id', bodyId)
		owner.aria.add('aria-describedby', bodyId)
	}
}
