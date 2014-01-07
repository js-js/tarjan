var tarjan = exports;

function State(i) {
  this.uid = i;
  this.parent = null;
  this.pred = [];
  this.id = null;
  this.semi = null;
}

function doEval(node, forest) {
  var state = node._tarjanState;
  if (forest.ancestor[state.id] === null)
    return node;

  doCompress(node, forest);
  return forest.label[state.id];
}

function doCompress(node, forest) {
  var state = node._tarjanState;
  var parent = forest.ancestor[state.id];
  var gparent = forest.ancestor[parent._tarjanState.id];

  if (gparent === null)
    return;

  doCompress(parent, forest);

  var label = forest.label[state.id];
  var plabel = forest.label[parent._tarjanState.id];
  if (plabel._tarjanState.semi < label._tarjanState.semi)
    forest.label[state.id] = plabel;
  forest.ancestor[state.id] = gparent;
}

// NOTE: Actually it is an SNCA implementation, but still by Tarjan
function run(vertexes) {
  vertexes.forEach(function(vertex, i) {
    vertex._tarjanState = new State(i);
  });

  function DFS(node, result) {
    var state = node._tarjanState;

    state.id = result.push(node) - 1;
    state.semi = state.id;

    for (var i = 0; i < node.$children.length; i++) {
      var child = node.$children[i];
      var childState = child._tarjanState;
      if (childState.semi === null) {
        childState.parent = node;
        DFS(child, result);
      }

      childState.pred.push(node);
    }
  }

  // DFS Traverse tree, populating nodes array
  var queue = [ vertexes[0] ];
  var nodes = [];
  DFS(vertexes[0], nodes);

  // Initialize forest
  var forest = { ancestor: [], label: [] };
  for (var i = 0; i < nodes.length; i++) {
    forest.ancestor[i] = null;
    forest.label[i] = nodes[i];
  }

  // Find semi-dominators
  var bucket = new Array(nodes.length);
  for (var i = nodes.length - 1; i > 0; i--) {
    var node = nodes[i];
    var state = node._tarjanState;

    for (var j = 0; j < state.pred.length; j++) {
      var pred = state.pred[j];
      var u = doEval(pred, forest);

      if (u._tarjanState.semi < state.semi)
        state.semi = u._tarjanState.semi;
    }

    forest.ancestor[node._tarjanState.id] = state.parent;
  }

  // Compute idom as a NCA(node.parent, node.semi) in DFS tree
  var idom = new Array(nodes.length);
  idom[0] = 0;
  for (var i = 1; i < nodes.length; i++)
    idom[i] = nodes[i]._tarjanState.parent._tarjanState.id;

  for (var i = 1; i < nodes.length; i++) {
    var node = nodes[i];
    var state = node._tarjanState;

    var index = idom[state.id];
    while (index > state.semi)
      index = idom[index];
    idom[state.id] = index;
  }

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    delete node._tarjanState;
    node.$idom = nodes[idom[i]];
  }
};

exports.create = function create(childrenKey, idomKey) {
  var src = run.toString()
               .replace(/\$children/g, childrenKey)
               .replace(/\$idom/g, idomKey);

  var ctx = new Function('State', 'doEval', 'doCompress', src + '\nreturn run');
  return ctx(State, doEval, doCompress);
};
