import { glob } from 'glob';

export async function listPosts(cwd: string): Promise<string[]> {
  return (await glob('**/README.mdx', { cwd }))
    .map((path) => path.replace(/[/\\]README\.mdx$/, ''))
    .sort();
}
