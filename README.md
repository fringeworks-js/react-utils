# @fringeworks/react-utils

`@fringeworks/react-utils` is a library some will find handy, offering hooks and functions for building React components.

**[日本語のREADMEはこちら](./README.ja.md)**

## Installation

```bash
npm install @fringeworks/react-utils
# or
pnpm add @fringeworks/react-utils
```

Supports React 18 and 19.

## Usage

You can import everything from the root, or import each feature from its own path.

```ts
// From the root
import { applyDefaultProps, useLatestRef } from '@fringeworks/react-utils';

// From the path of each feature
import applyDefaultProps from '@fringeworks/react-utils/utils/applyDefaultProps';
import useLatestRef from '@fringeworks/react-utils/hooks/useLatestRef';
```

## API

### Hooks

| Hook                                            | Description                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `useChangeEffect(dependencies, callback)`       | Runs an operation when the dependency values received through an `xxxOn` prop change |
| `useChangeLayoutEffect(dependencies, callback)` | A version of `useChangeEffect` that runs before the browser paints                   |
| `useCombinedRefs(...refs)`                      | Returns a callback ref that passes the value to all the given refs                   |
| `useConstant(factory)`                          | Keeps returning the value created on the first render until unmount                  |
| `useExecutionAt()`                              | Returns a value for an Execution Request prop and a function that triggers it        |
| `useExecutionEffect(request, callback)`         | Runs an operation when it is requested through an Execution Request prop             |
| `useExecutionLayoutEffect(request, callback)`   | A version of `useExecutionEffect` that runs before the browser paints                |
| `useExecutionMark()`                            | Returns an Execution Request without a payload and a function that makes a request   |
| `useIsHydrated()`                               | Returns whether hydration has finished                                               |
| `useIsMounted()`                                | Returns a function that tells whether the component is mounted                       |
| `useLatestRef(value)`                           | Returns a ref that holds the latest value                                            |
| `usePreviousValue(value, options?)`             | Returns the previous value                                                           |
| `useRerender()`                                 | Returns a function that only triggers a re-render                                    |
| `useStableCallback(callback)`                   | Returns a function with a stable reference that calls the latest callback            |
| `useStableLength(arr)`                          | Ensures that the length of an array does not change across renders                   |

### Functions

| Function                                              | Description                                                                |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `applyDefaultProps(props, ...defaults)`               | Fills `undefined` / `null` props with default values                       |
| `ensureComponent(component)`                          | Converts a built-in tag (such as `'div'`) into a component                 |
| `extendElement(element, overrideProps?, ...children)` | Clones an element, merging `className` and `style`                         |
| `forEachContent(children, callback)`                  | Iterates over elements, strings, and numbers, looking through Fragments    |
| `forEachElement(children, callback)`                  | Iterates over elements, looking through Fragments                          |
| `getComponentName(Component)`                         | Returns the name of a component, for use in an HOC's `displayName`         |
| `markAt()`                                            | Returns a value that increases on every call                               |
| `setRefCurrent(value, ...refs)`                       | Sets a value to multiple refs and returns a cleanup function               |
| `transformContent(children, callback)`                | Maps elements, strings, and numbers to an array, looking through Fragments |
| `transformElement(children, callback)`                | Maps elements to an array, looking through Fragments                       |

### `useChangeEffect`

```ts
useChangeEffect(
  dependencies: ChangeDependencies | undefined,
  callback: () => void,
): void
```

The receiving hook for `xxxOn` props (such as `refreshOn`). It runs `callback` when the received dependency values (Change Dependencies) change. The operation runs after the browser paints (`useEffect`).

Use it to run operations whose result depends only on their inputs, such as measuring or recalculating again, when the values passed by the user change. For commands where the count or the payload matters, use Execution Requests (`useExecutionAt`, `useExecutionEffect`).

- It compares the first-level properties with `Object.is` and runs when any of them changes. Added or removed properties also count as a change.
- Only the first level is compared. Object values are compared by reference, so putting an object created during rendering (such as `{ style }`) counts as a change every time.
- The dependency object itself may be written inline.
- It does not run on the first commit (mount).
- An `undefined` `dependencies` is treated as an object with no properties, so an optional prop can be passed as is.
- The latest `callback` is called. Changing the reference of `callback` does not run it.
- Putting an Execution Request (the value of `useExecutionAt`) in a property runs the operation on every request.

```tsx
// Passing side
<WrappedComponent refreshOn={{ className, theme }} />;

// Receiving side
type Props = { refreshOn?: ChangeDependencies };

function WrappedComponent({ refreshOn }: Props) {
  const instance = useConstant(() => createInstance());
  useChangeEffect(refreshOn, () => {
    instance.refresh();
  });
  // ...
}
```

| Parameter      | Type                              | Description                                            |
| -------------- | --------------------------------- | ------------------------------------------------------ |
| `dependencies` | `ChangeDependencies \| undefined` | The received dependency values                         |
| `callback`     | `() => void`                      | The operation to run when the dependency values change |

### `useChangeLayoutEffect`

```ts
useChangeLayoutEffect(
  dependencies: ChangeDependencies | undefined,
  callback: () => void,
): void
```

A version of `useChangeEffect` that runs the operation before the browser paints (`useLayoutEffect`). Use it for operations whose result should be reflected before painting, such as measuring again. Dependency values and parameters are handled the same way as `useChangeEffect`.

### `useCombinedRefs`

```ts
useCombinedRefs<T = unknown>(
  ...refs: (Ref<T> | undefined)[]
): RefCallback<T>
```

Returns a callback ref that sets the same value to all the given refs. Use it to pass both a ref received through `forwardRef` and a ref inside the component to a single element.

- The returned function keeps the same reference as long as none of the given refs change.
- `null` / `undefined` refs are ignored, so an optional `ref` prop can be passed as is.
- The number of refs must not change across renders. An error is thrown if it does.
- In React 19, the returned callback ref returns a cleanup function. It calls the cleanup functions returned by callback refs as they are, and passes `null` to the callback refs that returned none.

```tsx
const Input = forwardRef<HTMLInputElement>((props, ref) => {
  const innerRef = useRef<HTMLInputElement>(null);
  const combinedRef = useCombinedRefs(ref, innerRef);
  return <input {...props} ref={combinedRef} />;
});
```

### `useConstant`

```ts
useConstant<T>(factory: () => T): T
```

Calls `factory` on the first render and keeps returning the created value until the component unmounts.

`useMemo` is a performance optimization and does not guarantee that its cache is never discarded. Use this hook for values whose identity matters, such as stateful instances.

### `useExecutionAt`

```ts
useExecutionAt<P = void>(): UseExecutionAtResult<P>
```

A hook for components that wrap a part with an imperative API, letting you call its methods through props. It returns a value to pass to an Execution Request prop (a prop ending with `At`, such as `undoAt`) and a function that triggers it.

- `request.at` is `0` initially and increases every time `execute` is called. The receiving side runs the operation with `useExecutionEffect` / `useExecutionLayoutEffect`. Use `useExecutionMark` when no payload is needed.
- `execute` always keeps the same reference.

```tsx
const [undoAt, undo] = useExecutionAt<string>();

<button onClick={() => undo('no-123')}>Undo</button>
<WrappedImperativeComponent undoAt={undoAt} />
```

### `useExecutionEffect`

```ts
useExecutionEffect<P = void>(
  request: ExecutionRequest<P> | ExecutionMark | undefined,
  callback: (payload: P | undefined) => void,
): void
```

The receiving counterpart of `useExecutionAt` and `useExecutionMark`. When an operation is requested through an Execution Request prop, it runs `callback` with the request's `payload`. The operation runs after the browser paints (`useEffect`).

- It runs only when the mark (`request.at`, or the value of an `ExecutionMark`) changes. `payload` is not compared.
- A request that was already passed at mount is not run (the mark at mount is the baseline).
- It does not run when the mark is `0` (not requested yet).
- When it receives an `ExecutionMark`, the `payload` passed to `callback` is `undefined`. The mark does not have to be created by `markAt()` (any value that differs on every request works).
- If multiple requests are made before the next render, only the last one is run.
- The latest `callback` is called. Changing the reference of `callback` does not run it.
- An `undefined` `request` is treated as no request, so an optional prop can be passed as is.

```tsx
type Props = { undoAt?: ExecutionRequest<string> };

function WrappedImperativeComponent({ undoAt }: Props) {
  const instance = useConstant(() => createImperativeComponent());
  useExecutionEffect(undoAt, (payload) => {
    instance.undo(payload);
  });
  // ...
}
```

| Parameter  | Type                                | Description                                      |
| ---------- | ----------------------------------- | ------------------------------------------------ |
| `request`  | `ExecutionRequest<P> \| undefined`  | The value of the received Execution Request prop |
| `callback` | `(payload: P \| undefined) => void` | The operation to run when requested              |

### `useExecutionLayoutEffect`

```ts
useExecutionLayoutEffect<P = void>(
  request: ExecutionRequest<P> | ExecutionMark | undefined,
  callback: (payload: P | undefined) => void,
): void
```

A version of `useExecutionEffect` that runs the operation before the browser paints (`useLayoutEffect`). Use it for operations whose result should be reflected before painting, such as adjusting the scroll position or measuring again. Requests and parameters are handled the same way as `useExecutionEffect`.

### `useExecutionMark`

```ts
useExecutionMark(): UseExecutionMarkResult
```

A version of `useExecutionAt` without a payload. It returns an Execution Request without a payload (`ExecutionMark`, which is a number) and a function that makes a request. Use it to run methods that take no arguments, such as `focus()` or `reset()` of an imperative part, through props.

- The value is `0` (not requested yet) initially, and becomes a new value created by `markAt()` every time `execute` is called.
- `execute` always keeps the same reference.
- You may create an `ExecutionMark` yourself without this hook (for example, a value in a store or configuration). In that case, **make it different from the previous value on every request**. Passing the same value again is not treated as a new request. `markAt()` returns a different value on every call.

```tsx
const [focusAt, focus] = useExecutionMark();

<button onClick={focus}>Focus</button>
<WrappedImperativeComponent focusAt={focusAt} />
```

### `useIsHydrated`

```ts
useIsHydrated(): boolean
```

Returns whether hydration has finished. Use it to render client-only values (`window`, `localStorage`, the viewport width, and so on) without causing a hydration mismatch.

- Returns `false` during server rendering and hydration, and `true` afterwards.
- Returns `true` from the start in components mounted after hydration and in client-only rendering.
- Unlike checking `typeof window`, it returns `false` during hydration even on the client, so the output matches the server HTML.

```tsx
const isHydrated = useIsHydrated();

<p>{isHydrated ? navigator.userAgent : ''}</p>;
```

### `useIsMounted`

```ts
useIsMounted(): () => boolean
```

Returns a function that tells whether the component is mounted. Use it, for example, to avoid updating an unmounted component when an async task finishes.

- It becomes `true` when the DOM is committed (`useLayoutEffect`), and `false` on unmount.
- When called during rendering, it returns `false` until the first mount completes.
- The returned function always keeps the same reference.

### `useLatestRef`

```ts
useLatestRef<T>(value: T): LatestRef<T>
```

Returns a ref that holds the latest value. Since the ref is always the same object, you can read the latest value from event handlers and effects without adding it to dependency arrays.

- The value is updated on commit (`useInsertionEffect`), so it is already up to date inside `useLayoutEffect` / `useEffect`.
- Do not read it during rendering (it still holds the previous value before the commit).

### `usePreviousValue`

```ts
usePreviousValue<T = unknown>(
  value: T,
  options?: UsePreviousValueOptions<T>,
): T | undefined
```

Returns the previous value. It returns `initialValue` until the value changes for the first time.

When the value changes, the previous value is updated by a state update during rendering (no extra commit or effect run happens). Therefore, passing a value whose comparison is always `false` (such as an object or array created during rendering) causes endless re-rendering. Pass a value with a stable reference, or specify `isEqual`.

| Option          | Type                                    | Description                                                                           |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
| `initialValue?` | `T`                                     | The value returned until the value changes for the first time                         |
| `isEqual?`      | `(oldValue: T, newValue: T) => boolean` | A comparison that returns `true` for values considered equal. Defaults to `Object.is` |

### `useRerender`

```ts
useRerender(): () => void
```

Returns a function that only triggers a re-render. Use it when you want to render again without holding a value (for example, to show external state after reading it again).

- The returned function always keeps the same reference.

### `useStableCallback`

```ts
useStableCallback<A extends unknown[], R>(
  callback: (...args: A) => R,
): (...args: A) => R
```

Returns a function whose reference never changes and that calls the latest `callback`. Use it to keep the reference of an event handler passed to child components while always running the latest logic.

- The returned function always keeps the same reference.
- The latest `callback` is applied on commit. Do not call the function during rendering (the previous `callback` would be called). Call it from event handlers or effects.
- React 19.2's `useEffectEvent` can only be called from effects, while the function returned by this hook can also be passed to child components.

```tsx
const handleSelect = useStableCallback((id: string) => {
  onSelect(id, filter);
});

<MemoizedList onSelect={handleSelect} />;
```

### `useStableLength`

```ts
useStableLength(arr: readonly unknown[]): void
```

Ensures that the length of an array has not changed since the first render, and throws an error if it has. Use it, for example, when using a variable-length array as a dependency array of a hook.

### `applyDefaultProps`

```ts
applyDefaultProps<P extends object, const Ds extends readonly (Partial<P> | SkippedDefaults)[]>(
  props: P,
  ...defaults: Ds,
): AppliedProps<P, Ds>
```

Returns a new object in which the props that are `undefined` or `null` are filled with default values that are not `undefined`. The original `props` is not modified.

- You can pass multiple `defaults`. Per key, it behaves like `props[key] ?? d1[key] ?? d2[key] ?? ...`, so earlier arguments take precedence.
- `null` / `undefined` / `false` are skipped, so you can write conditional defaults such as `isCompact && compactDefaults`.
- In the return type, `null` / `undefined` are removed from the keys that definitely have a default value.
- A key in `defaults` that does not exist in `props` is a type error.

```ts
const { size, color } = applyDefaultProps(
  props,
  isCompact && { size: 'small' },
  { size: 'medium', color: 'primary' },
);
```

Limitations:

- Only string keys of `defaults` are applied (symbol keys are ignored).
- When the type of `props` is a union, `defaults` can only contain keys common to all members.

### `ensureComponent`

```ts
ensureComponent<C extends ElementType>(
  component: C,
): ComponentType<ComponentPropsWithRef<C>>
```

Converts a built-in tag (such as `'div'`) into a component that passes props and ref through as they are. A component is returned as is.

- The same component is returned for the same tag.
- Its `displayName` is `ensureComponent(tagName)`.

### `extendElement`

```ts
extendElement<P extends ExtendableProps>(
  element: ReactElement<P>,
  overrideProps?: Partial<P>,
  ...children: ReactNode[]
): ReactElement<P>
```

Clones an element (`cloneElement`) with `overrideProps` applied. The `key` and `ref` of the original element are kept.

| Property    | How it is applied                                                                |
| ----------- | -------------------------------------------------------------------------------- |
| `className` | Appended to the original `className`, separated by a space (empty is ignored)    |
| `style`     | Overrides the original `style` per property (`undefined` is ignored)             |
| Others      | Overrides the original value (properties whose value is `undefined` are ignored) |

| Parameter        | Type              | Description                                                |
| ---------------- | ----------------- | ---------------------------------------------------------- |
| `element`        | `ReactElement<P>` | The element to clone                                       |
| `overrideProps?` | `Partial<P>`      | The props to apply                                         |
| `...children`    | `ReactNode[]`     | The children. When omitted, the original children are kept |

### `forEachContent` / `forEachElement`

```ts
forEachContent(
  children: ReactNode,
  callback: (node: ReactElement | string | number, index: number) => void,
): void
forEachElement(
  children: ReactNode,
  callback: (node: ReactElement, index: number) => void,
): void
```

Iterates over `children`, looking through Fragments. `forEachContent` handles elements, strings, and numbers, while `forEachElement` handles only elements. `null` / `undefined` / booleans are not handled.

- Arrays and iterables are also expanded.
- `index` is a sequential number across Fragments.

### `getComponentName`

```ts
getComponentName(Component: ElementType): string
```

Returns the name of a component, for use in an HOC's `displayName` and the like.

- A built-in tag (such as `'div'`) is returned as is.
- `displayName` takes precedence over the function name.
- Returns `Unknown` when neither is available (or both are empty).

### `markAt`

```ts
markAt(): ExecutionMark
```

Returns a value that increases on every call. Values start from `1` and are never duplicated. `useExecutionAt` uses it for `request.at`, and `useExecutionMark` uses it for its value.

### `setRefCurrent`

```ts
setRefCurrent<T = unknown>(
  value: T | null,
  ...refs: (RefCallback<T> | RefObject<T | null> | null | undefined)[]
): () => void
```

Sets `current` of object refs and calls callback refs with `value`. `null` / `undefined` are ignored.

Calling the returned cleanup function sets `null` to object refs. For callback refs, it calls the cleanup function they returned, or calls them with `null` if they returned none.

### `transformContent` / `transformElement`

```ts
transformContent<T>(
  children: ReactNode,
  callback: (node: ReactElement | string | number, index: number) => T,
): T[]
transformElement<T>(
  children: ReactNode,
  callback: (node: ReactElement, index: number) => T,
): T[]
```

Processes `children` in the same order as `forEachContent` / `forEachElement`, and returns an array of the values returned by `callback`.

Unlike `Children.map`, keys are not reassigned. If different Fragments contain the same key, the key is duplicated in the returned array. When rendering the result as is, set keys inside `callback`.

```tsx
const items = transformElement(children, (element, index) => (
  <li key={index}>{element}</li>
));
```

### Types

| Type                         | Description                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AppliedProps<P, Ds>`        | The return type of `applyDefaultProps`                                                                                                                                               |
| `ChangeDependencies`         | The dependency values passed to an `xxxOn` prop (first-level properties are compared with `Object.is`)                                                                               |
| `CSSPropertiesWithVars`      | `CSSProperties` that also accepts CSS variables (`--name`)                                                                                                                           |
| `ExecutionFunction<P>`       | The trigger function returned by `useExecutionAt`                                                                                                                                    |
| `ExecutionRequest<P>`        | The value for an Execution Request prop returned by `useExecutionAt` (`at`, `payload`)                                                                                               |
| `ExtendableProps`            | The props of an element that `extendElement` accepts (`className`, `style`)                                                                                                          |
| `LatestRef<T>`               | The ref returned by `useLatestRef`                                                                                                                                                   |
| `ExecutionMark`              | An execution mark: an Execution Request without a payload, also the return type of `markAt` and the type of `ExecutionRequest`'s `at` (a number; make it different on every request) |
| `SkippedDefaults`            | Values skipped by `applyDefaultProps` (`null`, `undefined`, `false`)                                                                                                                 |
| `UseExecutionAtResult<P>`    | The return type of `useExecutionAt`                                                                                                                                                  |
| `UseExecutionMarkResult`     | The return type of `useExecutionMark`                                                                                                                                                |
| `UsePreviousValueOptions<T>` | The options of `usePreviousValue`                                                                                                                                                    |

## License

MIT
