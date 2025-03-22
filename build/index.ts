import {
  copyFile as fsCopyFile,
  mkdir,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";

import { PostAttribute } from "@mjy-blog/theme-lib";
import frontmatter from "front-matter";

import { existsSync } from "node:fs";
import { compile } from "./compile";
import { CorePost } from "./externalTypes";
import { listPosts } from "./listPosts";

interface CustomPostAttribute extends PostAttribute {
  excerpt: string;
}

async function copyFile(src: string, dest: string): Promise<void> {
  const stats = await stat(src);

  if (stats.isDirectory()) {
    await mkdir(dest, { recursive: true });

    const entries = await readdir(src);

    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);

      await copyFile(srcPath, destPath);
    }
  } else if (stats.isFile()) {
    await fsCopyFile(src, dest);
    if (process.env.VERBOSE) {
      console.log(`Copied file: ${src} -> ${dest}`);
    }
  } else {
    console.warn(`Skipped: ${src} is not a file or directory`);
  }
}

(async () => {
  const postPaths = await listPosts(resolve("src/posts"));
  const posts: CorePost<CustomPostAttribute>[] = [];
  for (let i = 0; i < postPaths.length; i++) {
    const path = postPaths[i];
    console.log(`(${i + 1}/${postPaths.length}) compiling ${path}`);
    const inPath = join("src/posts", path, "README.mdx");
    const outPath = join("out/posts", path, "page.js");
    if (existsSync(join("src/posts", path, "components"))) {
      await copyFile(
        join("src/posts", path, "components"),
        join("out/posts", path, "components")
      );
    }
    if (existsSync(join("src/posts", path, "static"))) {
      await copyFile(
        join("src/posts", path, "static"),
        join("out/public", path, "static")
      );
    }
    const { content, tocItems } = await compile(inPath, outPath);
    const { attributes } = frontmatter<any>(content);
    posts.push({
      path: join("posts", path, "page.js"),
      attributes,
      slug: path,
      tocItems,
    });
  }
  console.log("done.");
  await writeFile("out/index.json", JSON.stringify(posts));
})();
