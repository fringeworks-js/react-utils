# @fringeworks/react-utils

`@fringeworks/react-utils` は React のコンポーネントを作るときに使う hook や関数を集めた、誰かにとっては便利なライブラリです。

**[English README is available here](./README.md)**

## インストール

```bash
npm install @fringeworks/react-utils
# または
pnpm add @fringeworks/react-utils
```

React 18 と 19 に対応しています。

## 使い方

ルートからまとめて import するほか、機能ごとのパスから import することもできます。

```ts
// ルートから
import { applyDefaultProps, useLatestRef } from '@fringeworks/react-utils';

// 機能ごとのパスから
import applyDefaultProps from '@fringeworks/react-utils/utils/applyDefaultProps';
import useLatestRef from '@fringeworks/react-utils/hooks/useLatestRef';
```

## API

### hook

| hook                                | 説明                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `useCombinedRefs(...refs)`          | 複数の ref にまとめて値を渡す callback ref を返す                      |
| `useConstant(factory)`              | 初回のレンダリングで作った値を、アンマウントされるまで返し続ける       |
| `useExecutionAt(options?)`          | Execution Request プロパティに渡す値と、実行のきっかけになる関数を返す |
| `useIsMounted()`                    | マウントされているかどうかを判定する関数を返す                         |
| `useLatestRef(value)`               | 最新の値を保持する参照を返す                                           |
| `usePreviousValue(value, options?)` | 前回の値を返す                                                         |
| `useStableLength(arr)`              | 配列の要素数がレンダリングをまたいで変わらないことを確認する           |

### 関数

| 関数                                                  | 説明                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `applyDefaultProps(props, ...defaults)`               | props の `undefined` / `null` のプロパティにデフォルト値を反映する |
| `ensureComponent(component)`                          | 組み込みタグ（`'div'` など）をコンポーネントに変換する             |
| `extendElement(element, overrideProps?, ...children)` | `className` と `style` をマージしてエレメントを複製する            |
| `forEachContent(children, callback)`                  | Fragment を透過し、エレメント・文字列・数値を順に処理する          |
| `forEachElement(children, callback)`                  | Fragment を透過し、エレメントを順に処理する                        |
| `getComponentName(Component)`                         | HOC の `displayName` などに使う、コンポーネントの名前を返す        |
| `markAt()`                                            | 呼び出すたびに増加する値を返す                                     |
| `setRefCurrent(value, ...refs)`                       | 複数の ref に値を設定し、クリーンアップ関数を返す                  |
| `transformContent(children, callback)`                | Fragment を透過し、エレメント・文字列・数値を変換した配列を返す    |
| `transformElement(children, callback)`                | Fragment を透過し、エレメントを変換した配列を返す                  |

### `useCombinedRefs`

```ts
useCombinedRefs<T = unknown>(...refs: Ref<T>[]): RefCallback<T>
```

渡したすべての ref に同じ値を設定する callback ref を返します。`forwardRef` で受け取った ref と、コンポーネント内の ref を1つのエレメントに渡したい場合に使います。

- 返す関数の参照は、渡す ref がすべて変わらない限り変わりません。
- 渡す ref の数は、レンダリングをまたいで変えられません。変わった場合はエラーになります。
- React 19 では、返す callback ref がクリーンアップ関数を返します。callback ref が返したクリーンアップ関数はそのまま呼び、返さなかった callback ref には `null` を渡します。

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

初回のレンダリングで `factory` を呼んで作った値を、アンマウントされるまで返し続けます。

`useMemo` はパフォーマンスを最適化するための hook で、キャッシュが破棄されないことは保証されていません。状態を持つインスタンスなど、同じものであることが動作の前提になる値は、この hook で保持します。

### `useExecutionAt`

```ts
useExecutionAt<P = void>(
  options?: UseExecutionAtOptions<P>,
): UseExecutionAtResult<P>
```

命令的な API を持つ部品をラップしたコンポーネントで、プロパティを通じてそのメソッドを実行するための hook です。Execution Request プロパティ（`undoAt` のように `At` で終わるプロパティ）に渡す値と、実行のきっかけになる関数を返します。

- `request.at` は初期状態では `0` で、`execute` を呼ぶたびに増加します。受け取る側は `at` が変わったら処理を実行します。
- `execute` の参照は常に同じです。

```tsx
const [undoAt, undo] = useExecutionAt<string>();

<button onClick={() => undo('no-123')}>Undo</button>
<WrappedImperativeComponent undoAt={undoAt} />
```

| オプション        | 型  | 説明                              |
| ----------------- | --- | --------------------------------- |
| `initialPayload?` | `P` | 初期状態の `request.payload` の値 |

### `useIsMounted`

```ts
useIsMounted(): () => boolean
```

マウントされているかどうかを判定する関数を返します。非同期処理が終わったときに、アンマウント済みのコンポーネントを更新しないようにする場合などに使います。

- DOM へのコミット時（`useLayoutEffect`）に `true` になり、アンマウント時に `false` になります。
- レンダリング中に呼んだ場合は、初回のマウントが完了するまで `false` を返します。
- 返す関数の参照は常に同じです。

### `useLatestRef`

```ts
useLatestRef<T>(value: T): LatestRef<T>
```

最新の値を保持する参照を返します。参照は常に同じオブジェクトなので、依存配列に含めずに、イベントハンドラーやエフェクトの中から最新の値を参照できます。

- 値はコミット時（`useInsertionEffect`）に更新されるため、`useLayoutEffect` / `useEffect` の中からも最新の値を参照できます。
- レンダリング中には参照しないでください（コミット前のため、前回の値になります）。

### `usePreviousValue`

```ts
usePreviousValue<T = unknown>(
  value: T,
  options?: UsePreviousValueOptions<T>,
): T | undefined
```

前回の値を返します。値が一度も変わっていない間は `initialValue` を返します。

値が変わったときは、レンダリング中のステート更新で前回値を更新します（余分なコミットやエフェクトの実行は起きません）。そのため、比較が毎回 `false` になる値（レンダリング中に作るオブジェクトや配列など）を渡すと、再レンダリングが止まらなくなります。参照が安定した値を渡すか、`isEqual` を指定してください。

| オプション      | 型                                      | 説明                                                                   |
| --------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| `initialValue?` | `T`                                     | 値が一度も変わっていない間に返す値                                     |
| `isEqual?`      | `(oldValue: T, newValue: T) => boolean` | 同じ値とみなす場合に `true` を返す比較関数。未指定の場合は `Object.is` |

### `useStableLength`

```ts
useStableLength(arr: readonly unknown[]): void
```

配列の要素数が、初回のレンダリングから変わっていないことを確認します。変わった場合はエラーをスローします。可変長の配列を hook の依存配列に使う場合などに使います。

### `applyDefaultProps`

```ts
applyDefaultProps<P extends object, const Ds extends readonly (Partial<P> | SkippedDefaults)[]>(
  props: P,
  ...defaults: Ds,
): AppliedProps<P, Ds>
```

`props` のプロパティが `undefined` または `null` で、デフォルト値が `undefined` 以外の場合に、デフォルト値を反映した新しいオブジェクトを返します。元の `props` は変更しません。

- `defaults` は複数渡せます。キーごとに見ると `props[key] ?? d1[key] ?? d2[key] ?? ...` と同じように動作し、先の引数ほど優先されます。
- `null` / `undefined` / `false` を渡した場合はスキップします。`isCompact && compactDefaults` のように、条件付きのデフォルト値を書けます。
- 戻り値の型では、確実にデフォルト値があるキーから `null` / `undefined` が取り除かれます。
- `props` に無いキーを `defaults` に書くと型エラーになります。

```ts
const { size, color } = applyDefaultProps(
  props,
  isCompact && { size: 'small' },
  { size: 'medium', color: 'primary' },
);
```

制限事項:

- `defaults` のキーは文字列のものだけを反映します（symbol のキーは無視します）。
- `props` の型がユニオン型の場合、`defaults` に書けるのはすべての型に共通するキーだけです。

### `ensureComponent`

```ts
ensureComponent<C extends ElementType>(
  component: C,
): ComponentType<ComponentPropsWithRef<C>>
```

組み込みタグ（`'div'` など）を、props と ref をそのまま渡すコンポーネントに変換して返します。コンポーネントを渡した場合はそのまま返します。

- 同じタグには同じコンポーネントを返します。
- `displayName` は `ensureComponent(タグ名)` です。

### `extendElement`

```ts
extendElement<P extends ExtendableProps>(
  element: ReactElement<P>,
  overrideProps?: Partial<P>,
  ...children: ReactNode[]
): ReactElement<P>
```

`overrideProps` を反映してエレメントを複製します（`cloneElement`）。`key` と `ref` は元のエレメントのものを引き継ぎます。

| プロパティ  | 反映方法                                                            |
| ----------- | ------------------------------------------------------------------- |
| `className` | 元の `className` の後ろに空白区切りで追加する（空文字は無視する）   |
| `style`     | 元の `style` にプロパティ単位で上書きする（`undefined` は無視する） |
| それ以外    | 上書きする（値が `undefined` のプロパティは無視する）               |

| 引数             | 型                | 説明                                       |
| ---------------- | ----------------- | ------------------------------------------ |
| `element`        | `ReactElement<P>` | 複製するエレメント                         |
| `overrideProps?` | `Partial<P>`      | 反映するプロパティ                         |
| `...children`    | `ReactNode[]`     | 子要素。省略した場合は元の子要素を引き継ぐ |

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

Fragment を透過して `children` を順に処理します。`forEachContent` はエレメント・文字列・数値を、`forEachElement` はエレメントだけを処理します。`null` / `undefined` / 真偽値は処理しません。

- 配列や iterable も展開します。
- `index` は、Fragment をまたいだ連番です。

### `getComponentName`

```ts
getComponentName(Component: ElementType): string
```

HOC の `displayName` などに使う、コンポーネントの名前を返します。

- 組み込みタグ（`'div'` など）はそのまま返します。
- `displayName` を関数名より優先します。
- どちらも無い（空文字の）場合は `Unknown` を返します。

### `markAt`

```ts
markAt(): MarkAtResult
```

呼び出すたびに増加する値を返します。値は `1` から始まり、重複しません。`useExecutionAt` で `request.at` に使っています。

### `setRefCurrent`

```ts
setRefCurrent<T = unknown>(
  value: T | null,
  ...refs: (RefCallback<T> | RefObject<T | null> | null | undefined)[]
): () => void
```

object ref には `current` を設定し、callback ref は `value` を渡して呼びます。`null` / `undefined` は無視します。

戻り値のクリーンアップ関数を呼ぶと、object ref には `null` を設定します。callback ref は、呼んだときにクリーンアップ関数を返した場合はそれを呼び、返さなかった場合は `null` を渡して呼びます。

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

`forEachContent` / `forEachElement` と同じ順で `children` を処理し、`callback` の戻り値の配列を返します。

`Children.map` と異なり、key の付け直しは行いません。別々の Fragment の中に同じ key があると、戻り値の配列の中で key が重複します。戻り値をそのまま描画する場合は、`callback` の中で key を付けてください。

```tsx
const items = transformElement(children, (element, index) => (
  <li key={index}>{element}</li>
));
```

### 型

| 型                           | 説明                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `AppliedProps<P, Ds>`        | `applyDefaultProps` の戻り値の型                                                 |
| `CSSPropertiesWithVars`      | CSS 変数（`--name`）を書ける `CSSProperties`                                     |
| `ExecutionFunction<P>`       | `useExecutionAt` が返す、実行のきっかけになる関数                                |
| `ExecutionRequest<P>`        | `useExecutionAt` が返す、Execution Request プロパティに渡す値（`at`・`payload`） |
| `ExtendableProps`            | `extendElement` に渡せるエレメントの props（`className`・`style`）               |
| `LatestRef<T>`               | `useLatestRef` が返す参照                                                        |
| `MarkAtResult`               | `markAt` の戻り値の型                                                            |
| `SkippedDefaults`            | `applyDefaultProps` でスキップされる値（`null`・`undefined`・`false`）           |
| `UseExecutionAtOptions<P>`   | `useExecutionAt` のオプション                                                    |
| `UseExecutionAtResult<P>`    | `useExecutionAt` の戻り値の型                                                    |
| `UsePreviousValueOptions<T>` | `usePreviousValue` のオプション                                                  |

## ライセンス

MIT
