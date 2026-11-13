import fs from 'node:fs'
import path from 'node:path'
const file = path.resolve(import.meta.dirname, '../../new-components-2026-11-13.md')
let text = fs.readFileSync(file, 'utf8')
const replacements = [
	['×6 адаптеров', '× 6 адаптеров'],
	['все6', 'все 6'],
	['всеми6', 'всеми 6'],
	['всех6', 'всех 6'],
	['All6', 'All 6'],
	[
		'n50/act10/warm2/cycles20/rounds3/settle6000 ms',
		'n=50, act=10, warm=2, cycles=20, rounds=3, settle=6000 ms',
	],
	[
		'n50/act10/warm2/cycles20/rounds3/settle6000ms',
		'n=50, act=10, warm=2, cycles=20, rounds=3, settle=6000 ms',
	],
	['n=50/act10', 'n=50, act=10'],
	['rates1/4/6', 'rates=1/4/6'],
	['seed7', 'seed=7'],
	['warm2/reps10', 'warm=2, reps=10'],
	['N1/50/count-reps3', 'N=1/50, count-reps=3'],
	['errors0', 'errors=0'],
	['transitions0', 'transitions=0'],
	['core/emitters/listeners0', 'core/emitters/JS listeners=0'],
	[
		'scripts0/benchfalse/final document3elements',
		'scripts=0, benchPresent=false, final document: 3 elements',
	],
	['12numeric diagnostics', '12 numeric diagnostics'],
	['6live locale', '6 live locale'],
	['6CodeBlock', '6 CodeBlock'],
	['6readiness', '6 readiness'],
	['24cases62ee', '24 cases on 62ee'],
	['25cases', '25 cases'],
	['210target cases/engine', '204 cases девяти компонентов + 6 Avatar.Group на каждом engine'],
	[
		'Shared scenario suite150/150 all-six PASS',
		'Shared suite: 144 behavioral scenarios (24 × 6) + 6 inventory guards, все 150 PASS',
	],
	['SIGnal', 'SIGNAL'],
]
for (const [from, to] of replacements) text = text.replaceAll(from, to)
text = text
	.split('\n')
	.map((line) =>
		line.startsWith('|')
			? line
			: line
					.replace(
						/(\d)(?=адаптер|страниц|цикл|сценари|компонент|провер|ошиб|случа|повтор|сесс|копий|изображени|набор|режим|контрол)/g,
						'$1 ',
					)
					.replace(
						/(\d)(?=PASS|FAIL|inherited|component|target|memory|functional|native|static|raw|cycles\b|cases\b|pages\b|tests\b|errors\b|reports\b|engine\b|host\b|both\b|timed|reps\b|rates\b|measured|warmup|DOM\b|listeners\b|KiB|ms\b|min\b)/g,
						'$1 ',
					)
					.replace(/(\d)(B)(?=\b|heap)/g, '$1 $2')
					.replaceAll('= 0', ' = 0'),
	)
	.join('\n')
fs.writeFileSync(file, text, 'utf8')
console.log('Copy-edited prose; numeric raw tables unchanged')
