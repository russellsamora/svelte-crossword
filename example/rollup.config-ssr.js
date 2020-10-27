import svelte from 'rollup-plugin-svelte';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import execute from "rollup-plugin-execute";

export default {
  input: "App.svelte",
  output: {
    format: "cjs",
    file: "../docs/.tmp/ssr.js"
  },
  plugins: [
    svelte({
      generate: "ssr"
    }),
    resolve({
      browser: true,
      dedupe: ["svelte"]
    }),
    commonjs(),
    json(),
    execute("node pre-render.js")
  ]
};
