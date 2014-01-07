var assert = require('assert');
var tarjan = require('../');

describe('Tarjan algorithm', function() {
  function Node(id) {
    this.id = id;
    this.children = [];
    this.idom = null;
  }
  it('should support example from paper', function() {
    var R = new Node('R');
    var A = new Node('A');
    var B = new Node('B');
    var C = new Node('C');
    var D = new Node('D');
    var F = new Node('F');
    var E = new Node('E');
    var G = new Node('G');
    var H = new Node('H');
    var I = new Node('I');
    var J = new Node('J');
    var K = new Node('K');
    var L = new Node('L');

    R.children.push(C, B, A);
    C.children.push(F, G);
    B.children.push(E, A, D);
    F.children.push(I);
    G.children.push(I, J);
    E.children.push(H);
    A.children.push(D);
    I.children.push(K);
    J.children.push(I);
    H.children.push(K, E);
    D.children.push(L);
    K.children.push(R, I);
    L.children.push(H);

    var run = tarjan.create('children', 'idom');
    run([ R, A, B, C, D, E, F, G, H, I, J, K, L ]);

    assert.equal(A.idom.id, 'R');
    assert.equal(B.idom.id, 'R');
    assert.equal(C.idom.id, 'R');
    assert.equal(D.idom.id, 'R');
    assert.equal(E.idom.id, 'R');
    assert.equal(F.idom.id, 'C');
    assert.equal(G.idom.id, 'C');
    assert.equal(H.idom.id, 'R');
    assert.equal(I.idom.id, 'R');
    assert.equal(J.idom.id, 'G');
    assert.equal(K.idom.id, 'R');
    assert.equal(L.idom.id, 'D');
  });
});
