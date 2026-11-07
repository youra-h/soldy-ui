# Public Alert adapter API, packet 0.4

This reference describes supplied APIs; it is not an Alert implementation. Import all runtime helpers and library types from ./api. Sibling files may import each other. React imports are type-only. Do not reimplement these APIs.

## Props

The bridge exports AlertDescriptor (descriptor factory), TAlert (core class), UseDomProps and EventProps (generic types). Public props are exactly UseDomProps<typeof AlertDescriptor, TAlert, EventProps<typeof AlertDescriptor>>. They include ctrl?, DOM attrs/ref, core inputs, callback events and descriptor slots. text/description are strings; type is info|success|warning|error; announcement is off|polite|assertive; closable is boolean. Defaults/logic belong to the shared layer.

## Setup

useComponent(factory, props) creates and binds a descriptor context. The factory receives create; its call shape is create(DescriptorFactory(), { ctrl: props.ctrl, props }). Forward props to useComponent as its second argument. Return its binding directly; do not construct a fake binding. The binding contains {ctrl, state, ref, forwardProps, layer}. State and callback changes, locale, lifecycle and ref are managed by this helper. A supplied ctrl must be retained.

## Root

The typed adapter snapshot may have undefined values even when core defaults exist. For typed text/description slot scopes use a string fallback such as state.text ?? empty string and state.description ?? empty string. state exposes rendered:boolean, visible:boolean, tag, classes:string[], attrs/aria/dataset attribute maps, text, description, type, closable and closeAria. If rendered is false return null. toRootProps(ref, state, [state.attrs, state.aria, state.dataset], forwardProps) returns root props, including class/style, ref, attributes and hidden visibility. Render state.tag as a React ElementType with those props. Do not invent role, class or locale logic.

## Slots and parts

renderSlot(content, scope?) returns ReactNode|undefined. It calls a function slot with scope; null/false/undefined mean no content. Use ?? fallback. props.children receives {text:state.text}; props.content receives {description:state.description}; props.icon receives {type:state.type}; props.actions has no scope; props['close-icon'] has no scope.

Required parts: so-alert__icon (aria-hidden="true"), so-alert__text, so-alert__content, so-alert__actions, optional so-alert__close. Render these with the exact class names. Text and content fall back to state.text/state.description. actions may contain interactive children.

## Icon and close

roleIcon(role:string) returns a React component type for Icon.tag; it is not a React node or a string path. Icon is a supplied headless component, e.g. <Icon tag={SomeRoleComponent} embedded="alert.icon"/>. The fallback role is state.type ?? 'notification'; standard roles include info/success/warning/error/notification/close. close fallback is roleIcon('close'). Slot replacements override the corresponding fallback.

Button is a supplied headless component. Close is rendered only if state.closable. Button must have className="so-alert__close", embedded="alert.close", type="button", and {...toAriaProps(state.closeAria)}. toAriaProps converts an attribute map to React props. useClickAction(action:(event:Event)=>void) returns a ref callback; attach it to the close Button ref. The action is ctrl.hide(), not an onClick handler or own state. Call the hook unconditionally before an early rendered return to keep hook order. The close-icon slot/fallback goes inside this Button; Icon fallback is embedded="alert.close-icon".

## Acceptance

Core behavior and accessibility stay in the shared layer. No own timers, focus logic, DOM APIs, translations, event registry or state machine. Final acceptance uses unchanged React/types/SSR checks for events, slots, ref replacement/unmount, locale, role, close cancellation, form safety, StrictMode and hydration.
