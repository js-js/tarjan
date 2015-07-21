'use strict';

function Tarjan(pipeline) {
  this.pipeline = pipeline;

  // Reserve zero index for convenience
  this.dfs = new Array(this.pipeline.blocks.length + 1);
  this.vertex = new Array(this.dfs.length);
  this.semi = new Array(this.dfs.length);
  this.parent = new Array(this.dfs.length);
  this.bucket = new Array(this.dfs.length);
  this.dom = new Array(this.dfs.length);

  // EVAL + COMPRESS + LINK
  this.ancestor = new Array(this.dfs.length);
  this.label = new Array(this.dfs.length);
  this.size = new Array(this.dfs.length);
  this.child = new Array(this.dfs.length);

  for (var i = 0; i < this.dfs.length; i++) {
    this.dfs[i] = 0;
    this.vertex[i] = null;
    this.semi[i] = i;
    this.parent[i] = 0;
    this.bucket[i] = [];
    this.ancestor[i] = 0;
    this.label[i] = i;
    this.size[i] = 1;
    this.child[i] = 0;
    this.dom[i] = 0;
  }

  // Convenience for `link` method
  this.size[0] = 0;
}
module.exports = Tarjan;

Tarjan.create = function create(pipeline) {
  return new Tarjan(pipeline);
};

Tarjan.prototype.compute = function compute() {
  this.enumerate();
  this.build();

  // Store results in the pipeline
  for (var i = 1; i < this.dom.length; i++) {
    if (this.dom[i] === 0)
      continue;

    var dominator = this.vertex[this.dom[i]];
    var block = this.vertex[i];

    dominator.addChild(block);
  }
};

Tarjan.prototype.enumerate = function enumerate() {
  // DFS enumeration
  var queue = [ this.pipeline.blocks[0], 0 ];
  var dfs = 1;

  while (queue.length !== 0) {
    var parent = queue.pop();
    var block = queue.pop();
    if (this.dfs[block.blockIndex] !== 0)
      continue;

    this.dfs[block.blockIndex] = dfs;
    this.parent[dfs] = parent;
    this.vertex[dfs] = block;

    // Queue right and left successors of block
    for (var i = block.successors.length - 1; i >= 0; i--) {
      var succ = block.successors[i];
      queue.push(succ, dfs);
    }

    dfs++;
  }
};

Tarjan.prototype.build = function build() {
  var dfs = this.dfs;
  var vertex = this.vertex;
  var semi = this.semi;
  var bucket = this.bucket;
  var parent = this.parent;
  var dom = this.dom;

  /*
   * for i := n by -1 until 2 do
   *   w := vertex(i);
   *   # step 2
   *   for each v E pred(w) do
   *      u := EVAL(v); if semi(u} < semi(w) then semi(w) := semi(u) fi od;
   *   add w to bucket(vertex(semi(w)));
   *   LINK(parent(w), w);
   *   # step 3
   *   for each v E bucket(parent(w)) do
   *     delete v from bucket(parent(w));
   *     u := EVAL(v);
   *     dom(v) := if semi(u) < semi(v) then u
   *                 else parent(w) fi od od;
   */

  for (var w = dfs.length - 1; w >= 2; w--) {
    var predecessors = vertex[w].predecessors;
    for (var i = 0; i < predecessors.length; i++) {
      var v = dfs[predecessors[i].blockIndex];
      var u = this.evaluate(v);

      if (semi[u] < semi[w])
        semi[w] = semi[u];
    }

    bucket[semi[w]].push(w);
    this.link(parent[w], w);

    var parentBucket = bucket[parent[w]];
    while (parentBucket.length !== 0) {
      var v = parentBucket.pop();
      var u = this.evaluate(v);

      if (semi[u] < semi[v])
        dom[v] = u;
      else
        dom[v] = parent[w];
    }
  }

  /*
   * # step 4
   * for i := 2 until n do
   *   w := vertex(i);
   *   if dom(w) ~ vertex(semi(w)) then dom(w) := dom(dom(w)) fi od;
   * dom(r) := 0;
   */
  for (var w = 2; w < dfs.length; w++)
    if (dom[w] !== semi[w])
      dom[w] = dom[dom[w]];
  dom[1] = 0;
};

Tarjan.prototype.evaluate = function evaluate(v) {
  var ancestor = this.ancestor;
  var label = this.label;
  var semi = this.semi;

  /*
   * vertex procedure EVAL(v);
   *   comment procedure COMPRESS used here is identical to that in the
   *     simple method.
   *   if ancestor(v) = 0 then EVAL := label(v)
   *     else COMPRESS(v);
   *       EVAL := if semi(label(ancestor(v))) >_ semi(label(v))
   *         then label(v) else label(ancestor(v)) fi fi;
   */

  if (ancestor[v] === 0)
    return label[v];

  this.compress(v);

  if (semi[label[ancestor[v]]] >= semi[label[v]])
    return label[v];
  else
    return label[ancestor[v]];
};

Tarjan.prototype.link = function link(v, w) {
  var semi = this.semi;
  var label = this.label;
  var child = this.child;
  var size = this.size;
  var ancestor = this.ancestor;
  var label = this.label;

/*
 * procedure LINK(v, w);
 *   begin
 *     comment this procedure assumes for convenience that
 *       size(O) = label(O) = semi(O) = 0;
 *     S: = W;
 *     while semi(label(w)) < semi(label(child(s))) do
 *       if size(s) + size(child(child(s))) >_ 2*)size(child(s)) then
 *         ancestor(child(s)) := s; child(s) := child(child(s))
 *       else size(child(s)) := size(s);
 *         s := ancestor(s) := child(s) fi od;
 *     label(s) := label(w);
 *     size(v) := size(v) + size(w);
 *     if size(v) < 2*size(w) then s, child(v) := child(v), s fi;
 *     while s ~ 0 do ancestor(s) := v; s := child(s) od
 *   end LINK;
 */
  var s = w;

  while (semi[label[w]] < semi[label[child[s]]]) {
    if (size[s] + size[child[child[s]]] >= 2 * size[child[s]]) {
      ancestor[child[s]] = s;
      child[s] = child[child[s]];
    } else {
      size[child[s]] = size[s];
      ancestor[s] = child[s];
      s = ancestor[s];
    }
  }

  label[s] = label[w];
  size[v] += size[w];

  if (size[v] < 2 * size[w]) {
    var t = s;
    s = child[v];
    child[v] = t;
  }

  while (s !== 0) {
    ancestor[s] = v;
    s = child[s];
  }
};

Tarjan.prototype.compress = function compress(v) {
  var ancestor = this.ancestor;
  var semi = this.semi;
  var label = this.label;

  /*
   * procedure COMPRESS(v);
   *   comment this procedure assumes ancestor(v) ~ 0;
   *   if ancestor(ancestor(v)) ~ 0 then
   *     COMPRESS(ancestor(v));
   *     if semi(label(ancestor(v))) < semi(label(v)) then
   *       label(v) := label(ancestor(v)) fi;
   *     ancestor(v) := ancestor(ancestor(v)) fi;
   */

  if (ancestor[ancestor[v]] === 0)
    return;

  this.compress(ancestor[v]);

  if (semi[label[ancestor[v]]] < semi[label[v]])
    label[v] = label[ancestor[v]];
  ancestor[v] = ancestor[ancestor[v]];
};
