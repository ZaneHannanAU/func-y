## Vs Alternatives

func-y will render on-the-fly as an alternative to the collect-and-display of similar systems, such as `HyperHTML`/`ViperHTML` and `lit-html` styles.

First-render is exceedingly fast if the main styles are available.

A simple `for await` or `for (const thing of source) await write(stuff(thing))`

It is a streaming based parser, and capable of all of the same things as the Hyper and lit server side renderers are.

It has a set of built in `write` functions (sequential `write.all(data, data, data, ...datas)`, `write.next(err, data)`, `write.text(unsafe_string)` and plain `write(data)`).

It's capable of writing files (less useful with the exception of processing heavy stuff, like markdown/markdown-it).

It handles streams, promises and delays consistently.

It handles all data types (except `symbol`) in a consistent fashion.

It's fast and (primarily) in-memory.

It's lightweight, and capable of all of the above out-of-the-box (in node).

If looking for a highly interactive DOM, use hyperhtml/viperhtml.

If looking for a simple streaming HTML output, use this.

