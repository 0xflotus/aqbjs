/*jshint node: true, loopfunc: true */
/*globals describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  TernaryOperation = types.TernaryOperation,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('TernaryOperation', function () {
  it('returns an expression', function () {
    var expr = new TernaryOperation('?', ':', 'x', 'y', 'z');
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('accepts non-empty strings as operators', function () {
    var values = [
      '-',
      '~',
      '+',
      'not',
      'nöis3',
      '$$ $$%§-äß',
      'bad:bad:bad'
    ];
    for (var i = 0; i < values.length; i++) {
      var op = new TernaryOperation(values[i], values[i], 'x', 'y', 'z');
      expect(op.toAQL()).to.equal('x ' + values[i] + ' y ' + values[i] + ' z');
    }
  });
  it('does not accept any other values as operators', function () {
    var values = [
      '',
      new types.StringLiteral('for'),
      new types.RawExpression('for'),
      new types.SimpleReference('for'),
      new types.Keyword('for'),
      new types.NullLiteral(null),
      42,
      true,
      function () {},
      {},
      []
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {return new TernaryOperation(values[i], values[i], 'x', 'y', 'z');}).to.throwException(isAqlError);
    }
  });
  it('auto-casts values', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    for (var i = 0; i < arr.length; i++) {
      var op = new TernaryOperation('?', ':', arr[i], arr[i], arr[i]);
      expect(op._value1.constructor).to.equal(ctors[i]);
      expect(op._value2.constructor).to.equal(ctors[i]);
      expect(op._value3.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation values in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new TernaryOperation('?', ':', op, op, op).toAQL()).to.equal('(x) ? (x) : (x)');
  });
  it('wraps Statement values in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new TernaryOperation('?', ':', st, st, st).toAQL()).to.equal('(x) ? (x) : (x)');
  });
  it('wraps PartialStatement values in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new TernaryOperation('?', ':', ps, ps, ps).toAQL()).to.equal('(x) ? (x) : (x)');
  });
});