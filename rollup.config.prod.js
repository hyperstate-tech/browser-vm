import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import copy from 'rollup-plugin-copy';

const outputDir = './lib/';
const globalName = "BrowserVM"; // replace if your package name is not compatible

const banner = `/* **********************************
${pkg.name} version ${pkg.version}
@license ${pkg.license}

copyright Hyperstate Technologies Pvt. Ltd.
author ${pkg.author}
see README and LICENSE for details
********************************** */`;


export default [{
  input: ['./src/index.ts'],
  output: {
    dir: './dts/'
  },
  plugins: [
    del({ targets: ['dts/*', 'lib/*']}),
    typescript({ 
      declaration: true, 
      outDir: './dts/', 
      rootDir: './src/', 
      exclude: ['./test/**/*', './dts/**/*', './lib/**/*'] 
    }),
  ]
}, {
  input: "./dts/index.d.ts",
  output: [{ file: `./lib/browser-vm.d.ts`, format: "es" }],
  plugins: [dts()],
}, {
  input: ['src/index.ts'],
  output: [
    {
      file: outputDir + "browser-vm.esm.js",
      format: 'es',
      sourcemap: true,
      banner: banner
    },
    {
      file: outputDir + "browser-vm.js",
      name: globalName,
      format: 'umd',
      sourcemap: true,
      banner: banner
    }
  ],
  plugins: [
    generatePackageJson({
      baseContents: (pkg) => {
        pkg.scripts = {};
        pkg.dependencies = {};
        pkg.devDependencies = {};
        return pkg;
      }
    }),
    typescript(),
    terser(),
    copy({
      targets: [{
        src: 'README.md', dest: 'lib'
      },{
        src: 'LICENSE', dest: 'lib'
      },]
    }),
    del({ targets: ['dts/*']})
  ]
}];
