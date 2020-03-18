const CircuitElement = require('./circuitElement_refactored.js')
globalScope = undefined;

// Base circuit class
// All circuits are stored in a scope

class Scope{

    constructor(name = "localScope", id = undefined) {
        this.restrictedCircuitElementsUsed = [];
        this.id = id || Math.floor((Math.random() * 100000000000) + 1);
        this.CircuitElement = [];

        //root object for referring to main canvas - intermediate node uses this
        this.root = new CircuitElement(0, 0, this, "RIGHT", 1);
        this.backups = [];
        this.timeStamp = new Date().getTime();

        this.ox = 0;
        this.oy = 0;
//commented temporarily for testing
//        this.scale = DPR;
        this.tunnelList = {};
        this.stack = []

        this.name = name;
        this.pending = []
        this.nodes = []; //intermediate nodes only
        this.allNodes = [];
        this.wires = [];
//commented temporarily for testing
        // Creating arrays for other module elements
//        for (var i = 0; i < moduleList.length; i++) {
//            this[moduleList[i]] = [];
//        }

        // Setting default layout
        this.layout = { // default position
            width: 100,
            height: 40,
            title_x: 50,
            title_y: 13,
            titleEnabled: true,
        }


        // FOR SOME UNKNOWN REASON, MAKING THE COPY OF THE LIST COMMON
        // TO ALL SCOPES EITHER BY PROTOTYPE OR JUST BY REFERNCE IS CAUSING ISSUES
        // The issue comes regarding copy/paste operation, after 5-6 operations it becomes slow for unknown reasons
        // CHANGE/ REMOVE WITH CAUTION
        // this.objects = ["wires", ...circuitElementList, "nodes", ...annotationList];
        // this.renderObjectOrder = [ ...(moduleList.slice().reverse()), "wires", "allNodes"];
    }
    // Resets all nodes recursively
    reset() {
        for (var i = 0; i < this.allNodes.length; i++)
            this.allNodes[i].reset();
        for (var i = 0; i < this.Splitter.length; i++) {
            this.Splitter[i].reset();
        }
        for (var i = 0; i < this.SubCircuit.length; i++) {
            this.SubCircuit[i].reset();
        }

    }

    // Adds all inputs to simulationQueue
    addInputs() {
        for (var i = 0; i < inputList.length; i++) {
            for (var j = 0; j < this[inputList[i]].length; j++) {
                simulationArea.simulationQueue.add(this[inputList[i]][j], 0);
            }
        }

        for (let j = 0; j < this.SubCircuit.length; j++)
            this.SubCircuit[j].addInputs();

    }

    // Ticks clocks recursively -- needs to be deprecated and synchronize all clocks with a global clock
    clockTick() {
        for (var i = 0; i < this.Clock.length; i++)
            this.Clock[i].toggleState(); //tick clock!
        for (var i = 0; i < this.SubCircuit.length; i++)
            this.SubCircuit[i].localScope.clockTick(); //tick clock!
    }

    // Checks if this circuit contains directly or indirectly scope with id
    // Recursive nature
    checkDependency(id) {
        if (id == this.id) return true;
        for (var i = 0; i < this.SubCircuit.length; i++)
            if (this.SubCircuit[i].id == id) return true;

        for (var i = 0; i < this.SubCircuit.length; i++)
            if (scopeList[this.SubCircuit[i].id].checkDependency(id)) return true;

        return false
    }

    // Get dependency list - list of all circuits, this circuit depends on
    getDependencies() {
        var list = []
        for (var i = 0; i < this.SubCircuit.length; i++) {
            list.push(this.SubCircuit[i].id);
            list.extend(scopeList[this.SubCircuit[i].id].getDependencies());
        }
        return uniq(list);
    }

    // helper function to reduce layout size
    fixLayout() {
        var max_y = 20;
        for (var i = 0; i < this.Input.length; i++)
            max_y = Math.max(this.Input[i].layoutProperties.y, max_y)
        for (var i = 0; i < this.Output.length; i++)
            max_y = Math.max(this.Output[i].layoutProperties.y, max_y)
        if (max_y != this.layout.height)
            this.layout.height = max_y + 10;
    }

    // Function which centers the circuit to the correct zoom level
    centerFocus(zoomIn = true) {
        if (layoutMode) return;
        findDimensions(this);
        var minX = simulationArea.minWidth || 0;
        var minY = simulationArea.minHeight || 0;
        var maxX = simulationArea.maxWidth || 0;
        var maxY = simulationArea.maxHeight || 0;

        var reqWidth = maxX - minX + 150;
        var reqHeight = maxY - minY + 150;

        this.scale = Math.min(width / reqWidth, height / reqHeight)

        if (!zoomIn)
            this.scale = Math.min(this.scale, DPR);
        this.scale = Math.max(this.scale, DPR / 10);

        this.ox = (-minX) * this.scale + (width - (maxX - minX) * this.scale) / 2;
        this.oy = (-minY) * this.scale + (height - (maxY - minY) * this.scale) / 2;
    }
}
module.exports = Scope