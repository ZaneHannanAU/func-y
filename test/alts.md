## Vs Alternatives

func-y will render on-the-fly as an alternative to the collect-and-display of similar systems, such as `HyperHTML`/`ViperHTML` and `lit-html` styles.

First-render is exceedingly fast if the main styles are available.

A simple `for await` or `for (const thing of source) await write(stuff(thing))`

It is a streaming based parser/builder, and capable of all of the same things as the Hyper and lit server side renderers are.

It has a set of built in `write` functions (sequential `write.all(data, data, data, ...datas)`, `write.next(err, data)`, `write.text(unsafe_string)` and plain `write(data)`).

It's capable of writing/caching files (less useful with the exception of heavy stuff like markdown/markdown-it).

It handles streams, promises and delays consistently.

Can puke in data from anywhere (including different sites)

It handles all data types (except `symbol`) in a consistent fashion.

It's fast and (primarily) in-memory.

It's lightweight, and capable of all of the above out-of-the-box (in node).

If looking for a highly interactive DOM, use hyperhtml/viperhtml.

If looking for a simple streaming HTML (or just anything text based) output, use this.

TL;DR it's function based sequential data collection/export with enough extras to be used... basically anywhere.
