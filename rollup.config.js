import babel from "rollup-plugin-babel";
import external from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import { terser } from "rollup-plugin-terser";
import { uglify } from "rollup-plugin-uglify";

import packageJSON from "./package.json";
const input = "./src/index.js";
const minifyExtension = pathToFile => pathToFile.replace(/\.js$/, ".min.js");

const exports = {
	cjs: {
		input,
		output: {
			file: packageJSON.main,
			format: "cjs",
			sourcemap: true,
		},
		external: ["lottie-web"],
		plugins: [
			postcss({
				plugins: [autoprefixer],
			}),
			babel({
				exclude: "node_modules/**",
			}),
			external(),
			resolve(),
			commonjs(),
		],
	},
	cjs_min: {
		input,
		output: {
			file: minifyExtension(packageJSON.main),
			format: "cjs",
		},
		external: ["lottie-web"],
		plugins: [
			postcss({
				plugins: [autoprefixer],
			}),
			babel({
				exclude: "node_modules/**",
			}),
			external(),
			resolve(),
			commonjs(),
			uglify(),
		],
	},
	umd: {
		input,
		output: {
			file: packageJSON.browser,
			format: "umd",
			sourcemap: true,
			name: "lottie-react",
			globals: {
				react: "React",
				"prop-types": "PropTypes",
				"lottie-web": "Lottie",
			},
		},
		external: ["lottie-web"],
		plugins: [
			postcss({
				plugins: [autoprefixer],
			}),
			babel({
				exclude: "node_modules/**",
			}),
			external(),
			resolve(),
			commonjs(),
		],
	},
	umd_min: {
		input,
		output: {
			file: minifyExtension(packageJSON.browser),
			format: "umd",
			name: "lottie-react",
			globals: {
				react: "React",
				"prop-types": "PropTypes",
				"lottie-web": "Lottie",
			},
		},
		external: ["lottie-web"],
		plugins: [
			postcss({
				plugins: [autoprefixer],
			}),
			babel({
				exclude: "node_modules/**",
			}),
			external(),
			resolve(),
			commonjs(),
			terser(),
		],
	},
	es: {
		input,
		output: {
			file: packageJSON.module,
			format: "es",
			sourcemap: true,
			exports: "named",
		},
		external: ["lottie-web"],
		plugins: [
			postcss({
				plugins: [autoprefixer],
			}),
			babel({
				exclude: "node_modules/**",
			}),
			external(),
			resolve(),
			commonjs(),
		],
	},
	es_min: {
		input,
		output: {
			file: minifyExtension(packageJSON.module),
			format: "es",
			exports: "named",
		},
		external: ["lottie-web"],
		plugins: [
			postcss({
				plugins: [autoprefixer],
			}),
			babel({
				exclude: "node_modules/**",
			}),
			external(),
			resolve(),
			commonjs(),
			terser(),
		],
	},
};

export default [
	exports.cjs,
	exports.cjs_min,
	exports.umd,
	exports.umd_min,
	exports.es,
	exports.es_min,
];
