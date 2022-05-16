# rollup-plugin-swc

Rollup plugin to use SWC for javascript and typescript

## Installation

```shell
npm i -D @websysarch/rollup-plugin-swc
```

## Usage

```js
export default {
    input: 'src/index.ts',
    output: {
      dir: `dist`,
      format: 'es',
    },
    plugins: [
      swc({
        tsConfigPath: resolve('tsconfig.json'),
        rollup: { // Optional
          include: 'FilterPattern'
          exclude: 'FilterPattern'
        }
        minify: true,
        jsc: {
          target, // By default, targe is read from tsconfig.json
        },
      }),
    ],
  }
```

### Minimum required config

```js
export default {
  input: 'src/index.ts',
  output: { dir: 'dist', format: 'es' },
  plugins: [
    swc({
      jsc: { target: 'es2016' },
    }),
  ],
}
```
