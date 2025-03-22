// from https://mdxjs.com/docs/getting-started/

import babel from '@babel/core';
import parser from '@babel/parser';
import { compileSync } from '@mdx-js/mdx';
import estreeToBabel from 'estree-to-babel';
import rehypeKatex from 'rehype-katex';
import rehypeMermaid, { RehypeMermaidOptions } from 'rehype-mermaid';
import rehypePrismAll from 'rehype-prism-plus/all';
import rehypeRemoveComments, {
  Options as RehypeRemoveCommentsOptions,
} from 'rehype-remove-comments';
import remarkBreaks from 'remark-breaks';
import remarkCodeImport from 'remark-code-import';
import remarkCodeTitle from 'remark-code-title';
import remarkEmoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGFM from 'remark-gfm';
import remarkHeadingId from 'remark-heading-id';
import remarkHint from 'remark-hint';
import remarkInlineLinks from 'remark-inline-links';
import remarkMath from 'remark-math';
import remarkToc, { Options as RemarkTocOptions } from 'remark-toc';

export function babelPluginSyntaxMdx(): babel.PluginItem {
  return { parserOverride: babelParserWithMdx };
}

function babelParserWithMdx(value: any, options: any) {
  if (options.sourceFileName && /\.mdx?$/.test(options.sourceFileName)) {
    return compileSync(
      { value, path: options.sourceFileName },
      {
        remarkRehypeOptions: {
          clobberPrefix: 's-',
        },
        recmaPlugins: [recmaBabel],
        remarkPlugins: [
          remarkFrontmatter,
          remarkHeadingId,
          [remarkToc, <RemarkTocOptions>{ heading: '목차' }],
          remarkMath,
          remarkCodeImport,
          remarkCodeTitle,
          remarkEmoji,
          remarkHint as any, // TODO: fix type
          remarkInlineLinks,
          remarkGFM,
          remarkBreaks,
        ],
        rehypePlugins: [
          rehypeKatex,
          [rehypeMermaid, <RehypeMermaidOptions>{ strategy: 'pre-mermaid' }],
          rehypePrismAll,
          [
            rehypeRemoveComments,
            <RehypeRemoveCommentsOptions>{ removeConditional: true },
          ],
        ],
      },
    ).result;
  }

  return parser.parse(value, options);
}

function recmaBabel(this: { compiler: any }) {
  this.compiler = estreeToBabel;
}
