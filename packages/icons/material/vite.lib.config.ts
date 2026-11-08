// Расширение обязательно: с ним конфиг читает и нативный загрузчик Vite
import { libConfig } from '../../../tools/vite/lib.config.ts'

/**
 * Библиотечная сборка @soxa-ui/icons-material: данные иконок, сгенерированные
 * из SVG рядом. Зависимость от `@soxa-ui/setup` только типовая — в бандле её нет.
 * Декларации собирает `tsc -p tsconfig.build.json` вторым шагом скрипта `build`.
 */
export default libConfig({
	name: '@soxa-ui/icons-material',
	root: import.meta.dirname,
	entry: 'src/index.ts',
})
