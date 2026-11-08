import { noExplicitAny } from './rules/no-explicit-any'
import { solidPartProps } from './rules/solid-part-props'

/** Локальные правила eslint проекта. Подключаются в `eslint.config.ts` под именем `soxa`. */
export default {
	meta: { name: 'soxa' },
	rules: {
		'no-explicit-any': noExplicitAny,
		'solid-part-props': solidPartProps,
	},
}
