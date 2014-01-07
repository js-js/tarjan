var common = require('./fixtures/common');

describe('Tarjan algorithm', function() {

  it('should support example from paper', function() {
    common.test('R', function() {/*
      R -> C, B, A
      C -> F, G
      B -> E, A, D
      F -> I
      G -> I, J
      E -> H
      A -> D
      I -> K
      J -> I
      H -> K, E
      D -> L
      K -> R, I
      L -> H
    */}, function() {/*
      R -> A, B, C, D, E, H, I, K
      D -> L
      C -> F, G
      G -> J
    */});
  });
});
