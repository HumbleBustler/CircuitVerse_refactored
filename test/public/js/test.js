const CircuitElement = require('../../../public/js/circuitElement_refactored.js')
const Scope = require('../../../public/js/scope_refactored.js')
const Node = require('../../../public/js/node_refactored.js')
const assert = require('assert')

it('Node creation and testing (x, y)', () => {
	const scope1 = new Scope("scope1");
	
	const node1 = new Node(1, 1, 1, scope1.root);
  	assert.equal(node1.x, 1);
  	assert.equal(node1.y, 1);
  	assert.equal(node1.bitWidth, scope1.root.bitWidth);

  	const node2 = new Node(1, 1, 2, scope1.root);
  	assert.equal(node2.x, 1);
  	assert.equal(node2.y, 1);

  	const node3 = new Node(1, 3, 2, scope1.root, 101, "node3");
  	assert.equal(node3.bitWidth, 101);
  	assert.equal(node3.objectType, "Node");
    assert.equal(node3.id, 'node' + (uniqueIdCounter-1));
    assert.equal(node3.parent, scope1.root);
        // if (type != 2 && this.parent.nodeList !== undefined)
        //     this.parent.nodeList.push(this);

    assert.equal(node3.label, "node3");
    assert.equal(node3.prevx, undefined);
    assert.equal(node3.prevy, undefined);
    assert.equal(node3.leftx, 1);
    assert.equal(node3.lefty, 3);
    assert.equal(node3.x, 1);
    assert.equal(node3.y, 3);

    assert.equal(node3.type, 2);
    assert.equal(Array.isArray(node3.connections), true);
    assert.equal(node3.value, undefined);
    assert.equal(node3.radius, 5);
    assert.equal(node3.clicked, false);
    assert.equal(node3.hover, false);
    assert.equal(node3.wasClicked, false);
    assert.equal(node3.scope, node3.parent.scope);
    assert.equal(node3.prev, 'a');
    assert.equal(node3.count, 0);
    assert.equal(node3.highlighted, false);
    assert.equal(node3.parent.scope.nodes[node3.parent.scope.nodes.length-1],node3);
    assert.equal(node3.parent.scope.allNodes[node3.parent.scope.allNodes.length-1],node3);
    assert.equal(node3.queueProperties.inQueue, false);
    assert.equal(node3.queueProperties.time, undefined);
    assert.equal(node3.queueProperties.index, undefined);

    assert.equal(node3.propagationDelay, 0);
    assert.equal(node3.subcircuitOverride, false);
    assert.equal(node3.cleanDelete, node3.delete);
})

it('Testing setLabel()', () => {
	const scope1 = new Scope("scope1");
	const node1 = new Node(1, 1, 1, scope1.root);
  	assert.equal(node1.label, "");
  	node1.setLabel("node1");
  	assert.equal(node1.label, "node1");
})

it('Testing absX() and absY()', () => {
	const scope1 = new Scope("scope1");
	const node1 = new Node(1, 1, 1, scope1.root);
	//By default scope1.root.x = 0, scope1.root.y = 0
	assert.equal(node1.x + scope1.root.x, node1.absX());
  	assert.equal(node1.y + scope1.root.y, node1.absY());
  	var shift_root_by = 1
  	scope1.root.x = shift_root_by;
	scope1.root.y = shift_root_by;
	assert.equal(node1.x + shift_root_by, node1.absX());
  	assert.equal(node1.y + shift_root_by, node1.absY());

  	shift_root_by = 2.5
  	scope1.root.x = shift_root_by;
	scope1.root.y = shift_root_by;
	assert.equal(node1.x + shift_root_by, node1.absX());
  	assert.equal(node1.y + shift_root_by, node1.absY());
  	
})

it('Testing updateScope()', () => {
	const scope1 = new Scope("scope1");
	const scope2 = new Scope("scope2");
	const node1 = new Node(1, 1, 1, scope1.root);
  	assert.equal(node1.scope, scope1);
  	node1.updateScope(scope2);
  	assert.equal(node1.scope, scope2);
})

//Won't work until logix.js is refactored
it('Testing connectWireless()', () => {
	const scope1 = new Scope("scope1");
	const scope2 = new Scope("scope2");
	const node1 = new Node(1, 1, 1, scope1.root);
	const node2 = new Node(101, 51, 2, scope2.root);
  	node1.connectWireLess(node2);
  	assert.equal(node1.connections[node1.connections.length-1], node2);
  	assert.equal(node2.connections[node2.connections.length-1], node1);


	const node3 = new Node(1, 1, 1, scope1.root);
	const node4 = new Node(101, 51, 2, scope2.root);
  	node3.connectWireLess(node3);
  	assert.notEqual(node3.connections[node3.connections.length-1], node3);  	//check that a node does not connect to itself

  	node3.connectWireLess(node4);												//check that if a node3 connects to node4 then it should not connect again with node4 			
  	assert.equal(node3.connections[node3.connections.length-1], node4);
  	assert.equal(node4.connections[node4.connections.length-1], node3);
  	node3.connectWireLess(node5);
  	assert.equal(node3.connections[node3.connections.length-1], node5);
  	assert.equal(node5.connections[node5.connections.length-1], node3);
	node3.connectWireLess(node4);
  	assert.notEqual(node3.connections[node3.connections.length-1], node4);
  	assert.notEqual(node4.connections[node4.connections.length-1], node3);

})