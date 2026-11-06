/**
 * Определение TInputPlugin (namespace `input`) — ввод текста в поле Input и
 * Textarea.
 *
 * Переносит набранное из `<input>` или `<textarea>` в `value`, пока поле не
 * `readonly` и не `disabled`.
 */

import { definePlugin } from '../../../protected/define'
import { TInputPlugin } from '@soldy-ui/plugins'

export const InputPluginDescriptor = definePlugin({
	ctor: TInputPlugin,
	namespace: 'input',
})
