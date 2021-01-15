# webpack-ssr-hmr-boilerplate

This is just a template to build your own static site. For usage with server you'll have to fiddle around yourself for now (it's not that hard). If it will get traction, I'll probably provide an option to do that right out-of-the-box. But actually I hope that it's just a temporary solution. And now I'm going to just concentrate on parcel@2.

## Getting started

1. Install deps: `yarn`
2. Run webpack for node: `yarn run dev:node`
3. When the above command bundles it's first output, in another terminal, run: `yarn run dev:browser`
4. Edit whatever you need and enjoy hot reload for browser and node. But be aware of the note below.

## Notes

Node.js entrypoint can't hot-reload, you'll have to restart `yarn run dev:browser` after editing. You'll see message in terminal when that happens.

## License

[Just do what the fuck you want to](COPYING).
