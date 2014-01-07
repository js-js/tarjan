var tarjan = exports;

function Context() {
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

  function DFS(node, result) {
    var state = node._tarjanState;

    state.id = result.push(node) - 1;
    state.semi = state.id;

    for (var i = 0; i < node.$successors.length; i++) {
      var child = node.$successors[i];
      var childState = child._tarjanState;
      if (childState.semi === null) {
        childState.parent = node;
        DFS(child, result);
      }

      childState.pred.push(node);
    }
  }

  // NOTE: Actually it is an SNCA implementation, but still by Tarjan
  function computeDominatorTree(nodes) {
    // Initialize forest
    var forest = { ancestor: [], label: [] };
    for (var i = 0; i < nodes.length; i++) {
      forest.ancestor[i] = null;
      forest.label[i] = nodes[i];
    }

    // Find semi-dominators
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

    // Output dominator tree
    nodes[0].$parent = null;
    for (var i = 1; i < nodes.length; i++) {
      nodes[i].$parent = nodes[idom[i]];
      if (nodes[i].$parent.$children)
        nodes[i].$parent.$children.push(nodes[i]);
      else
        nodes[i].$parent.$children = [ nodes[i] ];
    }
  }

  // Cytron frontier algorithm
  function computeFrontier(nodes) {
    // Populate exit nodes
    var queue = [];
    for (var i = 0; i < nodes.length; i++)
      if (!nodes[i].$children)
        queue.push(nodes[i]);

    // Go up from them
    var df = [];
    while (queue.length > 0) {
      var node = queue.pop();
      var state = node._tarjanState;

      df[state.id] = {};

      // Local
      for (var i = 0; i < node.$successors.length; i++) {
        var succ = node.$successors[i];
        if (succ.$parent !== node)
          df[state.id][succ._tarjanState.id] = true;
      }

      // Up
      if (!node.$children)
        continue;
      for (var i = 0; i < node.$children.length; i++) {
        var child = node.$children[i];
        var dfKeys = Object.keys(df[child._tarjanState.id]);

        for (var j = 0; j < dfKeys.length; j++) {
          var childDom = nodes[dfKeys[j]];

          if (childDom.$parent !== node)
            df[stat.eid][dfKeys[j]] = true;
        }
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var frontier = df[nodes[i]._tarjanState.id];
      if (frontier)
        frontier = Object.keys(frontier);
      else
        frontier = [];

      for (var j = 0; j < frontier.length; j++)
        frontier[j] = nodes[frontier[j]];
      nodes[i].$frontier = frontier;
    }
  }

  function run(vertexes) {
    // Initialize state
    vertexes.forEach(function(vertex, i) {
      vertex._tarjanState = new State(i);
    });

    // DFS Traverse tree, populating nodes array
    var queue = [ vertexes[0] ];
    var nodes = [];
    DFS(vertexes[0], nodes);

    // Compute dominator tree
    computeDominatorTree(nodes);

    // Compute dominance frontier
    computeFrontier(nodes);

    // Remove internal properties
    for (var i = 0; i < nodes.length; i++)
      delete nodes[i]._tarjanState;
  }

  return run;
}

exports.create = function create(keys) {
  if (!keys)
    keys = {};

  var src = Context.toString()
               .replace(/^function.*{|}$/g, '')
               .replace(/\$successors/g, keys.successors || 'successors')
               .replace(/\$parent/g, keys.parent || 'parent')
               .replace(/\$children/g, keys.children || 'children')
               .replace(/\$frontier/g, keys.frontier || 'frontier');

  var ctx = new Function(src);
  return ctx();
};
