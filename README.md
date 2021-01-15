# webpack-ssr-hmr-boilerplate

This is a template to bundle your own HMR-enabled app for node and browsers
using webpack.

## Getting started

1. Install deps: `yarn`
2. Run webpack for node: `yarn run dev:node`
3. When the above command bundles it's first output, in another terminal,
   run: `yarn run dev:browser`
4. Edit whatever you need and enjoy hot reload for browser and node. But be
   aware of the note below.

## Notes

Node.js entrypoint can't hot-reload, you'll have to restart
`yarn run dev:browser` after editing. You'll see message in terminal when
that happens.

## License

[Just do what the fuck you want to](COPYING).
