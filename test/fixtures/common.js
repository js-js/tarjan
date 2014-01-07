var assert = require('assert');
var tarjan = require('../../');

function Node(id) {
  this.id = id;
  this.successors = [];

  this.parent = null;
  this.children = null;
}

function parse(root, src) {
  src = src.toString()
           .replace(/^function.*{\/\*|\*\/}$/g, '');

  var lines = src.split(/\r\n|\r|\n/g);
  var nodes = {};

  function toNode(id) {
    if (!nodes.hasOwnProperty(id))
      nodes[id] = new Node(id);
    return nodes[id];
  }

  lines.forEach(function(line) {
    var match = line.match(/([\w\d]+)\s*->\s*((?:[\w\d]+(?:\s*,\s*)?)*)/);
    if (match === null)
      return;

    var parent = toNode(match[1]);
    var successors = match[2].split(/\s*,\s*/g).map(toNode);

    successors.forEach(function(succ) {
      parent.successors.push(succ);
    });
  });

  return Object.keys(nodes).map(function(id) {
    return nodes[id];
  }).sort(function(a, b) {
    if (a.id === root)
      return -1;
    return 1;
  });
}

function stringify(list) {
  return list.filter(function(item) {
    return item.children && item.children.length !== 0;
  }).map(function(item) {
    return item.id + ' -> ' + item.children.map(function(item) {
      return item.id;
    }).sort().join(', ');
  }).join('\n');
}

exports.test = function test(root, input, expected) {
  var list = parse(root, input);

  var run = tarjan.create();
  run(list);

  var out = stringify(list);
  var exp = expected.toString()
                    .replace(/^function.*{\/\*|\*\/}$/g, '');
  exp = exp.split(/\r\n|\r|\n/g).map(function(line) {
    return line.replace(/^\s*/, '');
  }).filter(function(line) {
    return line;
  }).join('\n');

  assert.equal(out, exp);
}
