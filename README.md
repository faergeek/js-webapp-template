# webpack-ssr-hmr-boilerplate

This is just a template to build your own static site without bullshit. For usage with server you'll have to fiddle around yourself for now. If it will get traction, I'll probably provide option to do that right out-of-the-box.

## Getting started

1. Install deps: `yarn`
2. Run webpack for node: `yarn run dev:node`
3. When the above is done, in another terminal, run: `yarn run dev:browser`
4. ...
5. PROFIT.

## Notes

Node.js entrypoint can't reload, you'll have to restart `yarn run dev:browser` after editing. You'll see message in terminal when it happens.

## License

[Just do what the fuck you want to](https://github.com/faergeek/webpack-ssr-hmr-boilerplate/blob/master/COPYING).
