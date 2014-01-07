var assert = require('assert');
var tarjan = require('../');

describe('Tarjan algorithm', function() {
  function Node(id) {
    this.id = id;
    this.successors = [];

    this.parent = null;
    this.children = null;
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

    R.successors.push(C, B, A);
    C.successors.push(F, G);
    B.successors.push(E, A, D);
    F.successors.push(I);
    G.successors.push(I, J);
    E.successors.push(H);
    A.successors.push(D);
    I.successors.push(K);
    J.successors.push(I);
    H.successors.push(K, E);
    D.successors.push(L);
    K.successors.push(R, I);
    L.successors.push(H);

    var run = tarjan.create();
    run([ R, A, B, C, D, E, F, G, H, I, J, K, L ]);

    assert.equal(A.parent.id, 'R');
    assert.equal(B.parent.id, 'R');
    assert.equal(C.parent.id, 'R');
    assert.equal(D.parent.id, 'R');
    assert.equal(E.parent.id, 'R');
    assert.equal(F.parent.id, 'C');
    assert.equal(G.parent.id, 'C');
    assert.equal(H.parent.id, 'R');
    assert.equal(I.parent.id, 'R');
    assert.equal(J.parent.id, 'G');
    assert.equal(K.parent.id, 'R');
    assert.equal(L.parent.id, 'D');
  });
});
