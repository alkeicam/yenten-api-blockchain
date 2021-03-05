import typescript from '@rollup/plugin-typescript';
import rollupNodeResolve from 'rollup-plugin-node-resolve'
import rollupJson from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/yenten-api-blockchain.ts',
  output: [
    {
      file: 'dist/yenten-api-blockchain.esm.js',
      format: 'es',
    },
    {
      file: 'dist/yenten-api-blockchain.umd.js',
      format: 'umd',
      name: 'Yenten',
    },
  ],
  plugins: [
    commonjs({
      include: 'node_modules/axios/**'
    }),
    rollupNodeResolve({ jsnext: true, preferBuiltins: true, browser: true }),
    rollupJson(),
    typescript()],
};
