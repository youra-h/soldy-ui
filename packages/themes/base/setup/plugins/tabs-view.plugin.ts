import type { ITabs, ITabsItem, TTabsCollection } from '@soxa-ui/core'
import {
	TBasePlugin,
	TCollectionBundlesPlugin,
	TElementPlugin,
	TTabsActiveTabPlugin,
} from '@soxa-ui/plugins'
import type { IPluginContext, TActiveTabOffset } from '@soxa-ui/plugins'
import { afterPseudoTransitions } from './transitions'

/** Признак переезда на ряду: пока он стоит, тема ведёт геометрию переходом. */
const MOVING = '--so-tabs-active-moving'

/*
 * Active-tab geometry for themes, independent of view names.
 *
 * TTabsActiveTabPlugin supplies offsets from __bar, the nearest positioned
 * ancestor shared by the list and edge slots. This plugin writes
 * --so-tabs-active-pos/size and --so-tabs-gap-pos/size on the bar. The --so-
 * prefix prevents inherited application variables from becoming layout defaults.
 * When the element is ready, data-ready-animation marks initialized geometry.
 * Before then, themes may use a static selected-tab background. The first
 * geometry write has no movement flag, so indicators do not slide from a corner.
 *
 * When the active tab changes between measured tabs, --so-tabs-active-moving: 1
 * is written together with the new geometry. First measurement, no active tab,
 * resize, view changes and shifts of the same tab apply immediately. The flag
 * remains until bar pseudo-element transitions finish. Each write while moving
 * restarts the wait, including shifts caused by closing a neighboring tab. It
 * is an inline variable so geometry and transition flag are visible together
 * without waiting for an adapter render.
 *
 * This is theme-base behavior: only theme CSS consumes the geometry. Themes
 * install it through defineTheme (oren: setup/plugins/install.ts). It writes
 * both geometry pairs; the theme chooses which each view needs.
 */
export class TTabsViewPlugin extends TBasePlugin<ITabs> {
	private _tabs: ITabs | null = null
	private _engine: TTabsCollection | null = null
	/**
	 * Таб, чьё место плагин записал последним; `null` — ещё не записывал или
	 * записал нули: активного таба не было.
	 */
	private _drawn: ITabsItem | null = null
	/** Ряд, на котором стоит признак переезда; `null` — признака нет. */
	private _moving: HTMLElement | null = null
	/** Отмена ожидания конца переезда; `null` — плагин не ждёт. */
	private _stopWaiting: (() => void) | null = null

	override install(ctx: IPluginContext): void {
		super.install(ctx)

		this._tabs = ctx.getInstance<ITabs>()

		const element = ctx.get(TElementPlugin)

		element?.events.on('ready', () => {
			this._tabs?.dataset.add('ready-animation', true)
		})

		// Новый узел до замера рисуется как без плагина — статично
		element?.events.on('removed', () => this._forget())

		ctx.get(TCollectionBundlesPlugin)?.events.on('engine:bound', (engine) => {
			this._engine = engine as TTabsCollection
		})

		ctx.get(TTabsActiveTabPlugin)?.events.on('change:active-tab', ({ newValue: offset }) => {
			this._updateActiveTab(offset)
			this._updateGap(offset)
		})
	}

	override destroy(): void {
		this._forget()
		this._tabs = null
		this._engine = null

		super.destroy()
	}

	/** Место и длина активного таба по главной оси. */
	private _updateActiveTab(offset: TActiveTabOffset | null): void {
		const tabs = this._tabs
		const engine = this._engine

		if (!offset || !engine || !tabs) return

		const active = engine.extensions.activation.activeItem ?? null

		// Активного нет, а перейти есть куда: запись пропущена, и записанный
		// таб остаётся прежним
		if (!active && engine.extensions.tabs.hasEnabledTabs()) return

		const { barEl, offsetLeft, offsetWidth, offsetTop, offsetHeight } = offset

		if (this._drawn && active && active !== this._drawn) this._startMoving(barEl)

		this._drawn = active

		if (tabs.orientation === 'vertical') {
			barEl.style.setProperty('--so-tabs-active-pos', `${offsetTop}px`)
			barEl.style.setProperty('--so-tabs-active-size', `${offsetHeight}px`)
		} else {
			barEl.style.setProperty('--so-tabs-active-pos', `${offsetLeft}px`)
			barEl.style.setProperty('--so-tabs-active-size', `${offsetWidth}px`)
		}

		// Пока признак стоит, конец переезда ждётся от последней записи
		if (this._moving === barEl) {
			this._stopWaiting?.()
			this._stopWaiting = afterPseudoTransitions(barEl, () => this._stopMoving())
		}
	}

	/** Разрыв линии ряда под активным табом. */
	private _updateGap(offset: TActiveTabOffset | null): void {
		const tabs = this._tabs

		if (!offset || !this._engine || !tabs) return

		const { barEl, offsetLeft, offsetWidth, offsetTop, offsetHeight } = offset

		if (tabs.orientation === 'vertical') {
			barEl.style.setProperty('--so-tabs-gap-pos', `${offsetTop + 1}px`)
			barEl.style.setProperty('--so-tabs-gap-size', `${offsetHeight - 1}px`)
		} else {
			barEl.style.setProperty('--so-tabs-gap-pos', `${offsetLeft + 1}px`)
			barEl.style.setProperty('--so-tabs-gap-size', `${offsetWidth - 1}px`)
		}
	}

	/** Признак переезда на ряд — до записи нового места. */
	private _startMoving(bar: HTMLElement): void {
		if (this._moving !== bar) this._stopMoving()

		bar.style.setProperty(MOVING, '1')
		this._moving = bar
	}

	/** Снять признак переезда и ожидание его конца. */
	private _stopMoving(): void {
		this._stopWaiting?.()
		this._stopWaiting = null

		this._moving?.style.removeProperty(MOVING)
		this._moving = null
	}

	/**
	 * Забыть всё, что плагин нарисовал: узел снят или плагин уничтожен. Новый
	 * узел до первого замера получит прежнюю разметку без переменных — тема
	 * рисует её статично, — а его первая запись идёт без признака.
	 */
	private _forget(): void {
		this._stopMoving()
		this._drawn = null
		this._tabs?.dataset.remove('ready-animation')
	}
}
