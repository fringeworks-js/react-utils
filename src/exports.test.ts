import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 公開している各機能のフォルダーについて、export の規則を検査する
 *
 * - 各フォルダーの index は default export に加えて、フォルダー名と同じ名前で named export する
 * - カテゴリーとルートの index は、各フォルダーの named export を引き継ぐ
 *
 * `export *` は default export を引き継がないため、
 * フォルダー名と同じ名前の export を書き忘れると、カテゴリーとルートから黙って消える。
 */
const root = dirname(fileURLToPath(import.meta.url));
const isPublicDir = (path: string, name: string) =>
  !name.startsWith('_') && statSync(join(path, name)).isDirectory();

const categories = readdirSync(root).filter((name) => isPublicDir(root, name));
const folders = categories.flatMap((category) =>
  readdirSync(join(root, category))
    .filter((name) => isPublicDir(join(root, category), name))
    .map((name) => [category, name] as const),
);

describe('exports', () => {
  // ルートの読み込みは全モジュールを読み込むため時間がかかる
  let rootModule: Record<string, unknown>;
  beforeAll(async () => {
    rootModule = await import('./index.ts');
  }, 60_000);

  it('公開しているフォルダーがある', () => {
    expect(folders.length).toBeGreaterThan(0);
  });

  describe.each(folders)('%s/%s', (category, name) => {
    it('フォルダー名と同じ名前で default export と同じものを export している', async () => {
      const module = await import(`./${category}/${name}/index.ts`);
      expect(module[name]).toBeDefined();
      expect(module[name]).toBe(module.default);
    });

    it('カテゴリーとルートから export されている', async () => {
      const module = await import(`./${category}/${name}/index.ts`);
      const categoryModule = await import(`./${category}/index.ts`);
      expect(categoryModule[name]).toBe(module[name]);
      expect(rootModule[name]).toBe(module[name]);
      expect(categoryModule.default).toBeUndefined();
    });
  });
});
