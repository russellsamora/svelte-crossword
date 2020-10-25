import svelte from "rollup-plugin-svelte-hot";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import hmr from "rollup-plugin-hot";

const dev = !!process.env.ROLLUP_WATCH;

export default {
  input: "example/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js"
  },
  plugins: [
    svelte({
      dev: dev,
      hydratable: !dev,
      css: css => {
        css.write("public/build/bundle.css");
      },
      hot: dev && {
        optimistic: true
      }
    }),
    resolve({
      browser: true,
      dedupe: ["svelte"]
    }),
    commonjs(),
    dev && serve(),
    dev &&
      hmr({
        public: "public",
        inMemory: true,
        compatModuleHot: !dev
      }),
    json()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;
  return {
    name: "svelte/template:serve",
    writeBundle() {
      if (!started) {
        started = true;
        const flags = ["run", "start", "--", "--dev"];
        require("child_process").spawn("npm", flags, {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true
        });
      }
    }
  };
}