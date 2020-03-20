const Wire = require('../../../public/js/wire_refactored.js')
const Node = require('../../../public/js/node_refactored.js')
const Scope = require('../../../public/js/scope_refactored.js')
const CircuitElement = require('../../../public/js/circuitElement_refactored.js')
const assert = require('assert')

describe('Testing wire_refactored.js functions', function() {
	it('Testing function updateScope()', () => {
	  	const scope1 = new Scope("scope1");
	  	const scope2 = new Scope("scope2");
		const node1 = new Node(1, 1, 2, scope1.root);
		const node2 = new Node(9, 6, 2, scope2.root);
		const Wire1 = new Wire(node1, node2, scope1);
	  	assert.equal(Wire1.scope, scope1);
	  	Wire1.updateScope(scope2);
	  	assert.equal(Wire1.scope, scope2);
	});
});
