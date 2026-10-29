/**
 * 変化を見る依存の値（Change Dependencies）
 *
 * プロパティごとに `Object.is` で比べ、どれかが変わったら変化とみなす。
 * 比べるのは1段目のプロパティだけで、プロパティの値がオブジェクトの場合は参照で比べる。
 * そのため、オブジェクトをその場で書いて渡してよい（例: `{ className, theme }`）。
 * Execution Request（`useExecutionAt` の値）を入れると、要求のたびに変化とみなす。
 */
export type ChangeDependencies = object;
