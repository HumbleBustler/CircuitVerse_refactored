//From subcircuit.js

class loadSubCircuit{
	constructor(savedData, scope){
		var v = new SubCircuit(savedData["x"], savedData["y"], scope, savedData["id"], savedData);
	}
}