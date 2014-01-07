# Tarjan-Languer Fast Algorithm for Finding Dominators in a Flow Graph

## API

```javascript
// List of all nodes with their children in a flow graph
// (i.e. a flow graph itself)
var nodes = [
  { children: [...] },
  { children: [...] }
];

var tarjan = require('tarjan').create('children', 'idom');
tarjan(nodes);

console.log(nodes[1].idom);
```
