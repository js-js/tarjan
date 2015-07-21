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
      C -> F, G
      G -> J
      D -> L
    */});
  });

  it('should support example from cytron', function() {
    common.test('Entry', function() {/*
      Entry -> 1, Exit
      1 -> 2
      2 -> 3, 7
      3 -> 4, 5
      4 -> 6
      5 -> 6
      6 -> 8
      7 -> 8
      8 -> 9
      9 -> 10
      9 -> 11
      11 -> 9, 12
      12 -> 2, Exit
    */}, function() {/*
      Entry -> 1, Exit
      1 -> 2
      2 -> 3, 7, 8
      3 -> 4, 5, 6
      8 -> 9
      9 -> 10, 11
      11 -> 12
    */});
  });
});
