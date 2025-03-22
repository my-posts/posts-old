#!/bin/sh

set -e

cd "$(dirname "$0")"

if command -v cmd > /dev/null; then
  PWD="$(cmd //c cd | sed 's|\\|\\\\\\\\|g' | sed s/\"/\\\"/g)"
else
  PWD="$(pwd | sed 's|\\|\\\\\\\\|g' | sed s/\"/\\\"/g)"
fi

echo '[
  {
    "directory": "[[WORKSPACE]]",
    "file": "src/lib.c",
    "output": "/dev/null",
    "arguments": [
      "clang",
      "-xc",
      "src/lib.c",
      "-o",
      "/dev/null",
      "-I",
      "embed/src",
      "-Werror",
      "-pedantic",
      "-std=c99",
      "-Wall",
      "-Wextra",
      "-Wpedantic",
      "-c"
    ]
  }
]
' | sed "s\\[\\[WORKSPACE\\]\\]$PWDg" > compile_commands.json
