/** Internal bridge for template-owned native props; external element properties stay native. */
export const NATIVE_INPUT = Symbol('soxa.native-input')

/** Synchronize the model before a native setter whose polyfill callback may be delayed. */
export function syncNativeInput(target: object, name: string, value: unknown): void {
	const write: unknown = Reflect.get(target, NATIVE_INPUT)

	if (typeof write === 'function') write.call(target, name, value)
}
