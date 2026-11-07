import {
	Directive,
	ElementRef,
	EventEmitter,
	forwardRef,
	inject,
	type OnDestroy,
} from '@angular/core'
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms'
import type { TBinding } from './useAdapter'

/** One forms bridge for every descriptor with a writable value model. */
@Directive({
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => ValueAccessorDirective),
			multi: true,
		},
	],
})
export class ValueAccessorDirective implements ControlValueAccessor, OnDestroy {
	private readonly _host = inject<ElementRef<Element>>(ElementRef).nativeElement
	private _binding?: Pick<TBinding, 'syncInputs' | 'syncEvents' | 'resetInputs'>
	private _pending: Record<string, unknown> = {}
	private _writing = 0
	private _onChange?: (value: unknown) => void
	private _onTouched = () => {}
	private _stop?: () => void

	/** Forms may write before the component's ngOnInit assembles the binding. */
	initialInputs(): Record<string, unknown> {
		return this._pending
	}

	connect(binding: Pick<TBinding, 'syncInputs' | 'syncEvents' | 'resetInputs'>): void {
		this._binding = binding
		const pending = this._pending
		this._pending = {}
		this._write(pending)
		this._listen()
	}

	writeValue(value: unknown): void {
		// null is Angular's reset sentinel; undefined resets the descriptor to its default.
		this._write({ value: value ?? undefined })
	}

	setDisabledState(disabled: boolean): void {
		this._write({ disabled })
	}

	registerOnChange(fn: (value: unknown) => void): void {
		this._onChange = fn
		this._listen()
	}

	registerOnTouched(fn: () => void): void {
		this._onTouched = fn
	}

	/** Moving between nodes inside one control does not finish its interaction. */
	private _blur(event: FocusEvent): void {
		if (event.relatedTarget instanceof Node && this._host.contains(event.relatedTarget)) return

		this._onTouched()
	}

	ngOnDestroy(): void {
		this._stop?.()
	}

	private _write(inputs: Record<string, unknown>): void {
		if (!this._binding) {
			Object.assign(this._pending, inputs)
			return
		}

		this._writing++
		try {
			if (Object.hasOwn(inputs, 'value') && inputs['value'] === undefined) {
				this._binding.resetInputs(['value'])
			}
			this._binding.syncInputs(inputs)
		} finally {
			this._writing--
		}
	}

	private _listen(): void {
		if (!this._binding || !this._onChange || this._stop) return

		const emitter = new EventEmitter<unknown>()
		const subscription = emitter.subscribe((value: unknown) => {
			if (!this._writing) this._onChange?.(value)
		})
		const blur = new EventEmitter<unknown>()
		const blurSubscription = blur.subscribe((event: unknown) => {
			if (event instanceof FocusEvent) this._blur(event)
		})
		const stop = this._binding.syncEvents((name) => {
			if (name === 'valueChange') return emitter
			if (name === 'soActionBlur') return blur
			return undefined
		})

		this._stop = () => {
			stop()
			subscription.unsubscribe()
			blurSubscription.unsubscribe()
		}
	}
}
