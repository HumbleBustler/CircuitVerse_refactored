const wire_refactored = require('../../../public/js/wire_refactored.js')
const node_file = require('../../../public/js/node_refactored.js')
const Scope = require('../../../public/js/logix.js')
const assert = require('assert')

it('Trying for Wire', () => {
  	const scope1 = new Scope("scope1");
  	const scope2 = new Scope("scope2");
	const node1 = new Node(1, 1, 2, scope1);
	const node2 = new Node(9, 6, 2, scope2);
	const Wire1 = new Wire(node1, node2, scope1);
  	assert.equal(Wire1.scope, scope1);
  	Wire1.updateScope(globalScope);
  	assert.equal(Wire1.scope, scope2);
})
