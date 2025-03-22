import { mkdir, readFile, writeFile } from 'node:fs/promises';

import babel from '@babel/core';

import { TocItem } from '@mjy-blog/theme-lib';
import { dirname } from 'node:path';
import { babelPluginSyntaxMdx } from './plugin';

const original = `export default function MDXContent(props = {}) {
  const {
    wrapper: MDXLayout
  } = props.components || {};
  return MDXLayout ? _jsx(MDXLayout, {
    ...props,
    children: _jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}`;

const replacement = `export { _createMdxContent as default };`;

export interface CompileResult {
  content: string;
  replacedCode: string;
  tocItems: TocItem[];
}

export async function compile(
  inFilePath: string,
  outFilePath: string,
): Promise<CompileResult> {
  const content = (await readFile(inFilePath)).toString();
  const result = await babel.transformAsync(content, {
    filename: inFilePath,
    plugins: [babelPluginSyntaxMdx],
  });
  const code = result!.code!;

  if (!code.endsWith(original)) {
    throw new Error('Dependencies updated, build script must be updated.');
  }
  const replacedCode =
    code.substring(0, code.length - original.length) + replacement;

  await mkdir(dirname(outFilePath), { recursive: true });
  await writeFile(outFilePath, replacedCode);

  const tocItems: TocItem[] = extractTocItems(content);

  return { content, replacedCode, tocItems };
}

// TODO: parse MDX to prevent false positives
const regex = /^(#+) (.*?) \\\{#(.*?)\\\}$/gm;
function extractTocItems(input: string): TocItem[] {
  const matches: TocItem[] = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    matches.push({
      level: match[1].length,
      title: match[2].trim(),
      id: match[3],
    });
  }

  return matches;
}
