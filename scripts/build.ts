import fs from 'fs';
import url from 'url';
import path from 'path';
import iconv from 'iconv-lite';
import { loadDictList } from '../worddata/index.js';
import { toKotoeriDict, toMacUserDict, toWindowsImeDict, toWnnDict1, toWnnDict2 } from './lib/platform.js';
import { generateDocs } from './lib/docgen.js';
import { DictItem } from '../worddata/dict.js';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const docDir = path.join(dirname, '..', 'docs');
const distDir = path.join(dirname, '..', 'genshin-dictionary');
const winDictFile = path.join(distDir, '原神辞書_Windows.txt');
const macDictFile = path.join(distDir, '原神辞書_macOS.txt');
const macUserDictFile = path.join(distDir, '原神辞書_macOS_ユーザ辞書.plist');
const wnnDict1File = path.join(distDir, '原神辞書_Wnn_1.txt');
const wnnDict2File = path.join(distDir, '原神辞書_Wnn_2.txt');

console.log('辞書データを構築しています...');

(async function main() {
  const dictList = await loadDictList();
  const words = dictList
    .reduce<DictItem[]>((prev, curr) => [...prev, ...curr.items], [])
    .sort((a, b) => a.hiragana.localeCompare(b.hiragana, 'ja'));

  const winIme = toWindowsImeDict(words);
  const kotoeri = toKotoeriDict(words);
  const plist = toMacUserDict(words);
  const wnn1 = toWnnDict1(words);
  const wnn2 = toWnnDict2(words);

  console.log('ドキュメントを生成しています...');

  const docs = generateDocs(dictList);

  for (const doc of docs) {
    const filePath = path.join(docDir, doc.slug + '.md');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, doc.content, 'utf8');
  }

  console.log('ファイルに書き出しています...');

  fs.writeFileSync(winDictFile, iconv.encode(winIme, 'utf16'));
  fs.writeFileSync(macDictFile, kotoeri, 'utf8');
  fs.writeFileSync(macUserDictFile, plist, 'utf8');
  fs.writeFileSync(wnnDict1File, wnn1, 'utf8');
  fs.writeFileSync(wnnDict2File, wnn2, 'utf8');

  console.log('完了しました');
  console.log(winDictFile);
  console.log(macDictFile);
  console.log(macUserDictFile);
  console.log(wnnDict1File);
  console.log(wnnDict2File);
})();
