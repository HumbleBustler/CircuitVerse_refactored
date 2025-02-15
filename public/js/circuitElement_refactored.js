alwaysResolve = false
propagationDelay = 100
overrideDirectionRotation = false;
propagationDelayFixed = false;
class CircuitElement{
    constructor(x, y, scope, dir, bitWidth) {
        // Data member initializations
        this.objectType = this.constructor.name;
        this.x = x;
        this.y = y;

        this.hover = false;
        if (this.x == undefined || this.y == undefined) {
            this.x = simulationArea.mouseX;
            this.y = simulationArea.mouseY;
            this.newElement = true;
            this.hover = true;
        }

        this.deleteNodesWhenDeleted = true; // FOR NOW - TO CHECK LATER

        this.nodeList = []
        this.clicked = false;

        this.oldx = x;
        this.oldy = y;

        /**
         The following attributes help in setting the touch area bound. They are the distances from the center.
         Note they are all positive distances from center. They will automatically be rotated when direction is changed.
         To stop the rotation when direction is changed, check overrideDirectionRotation attribute.
         **/
        this.leftDimensionX = 10;
        this.rightDimensionX = 10;
        this.upDimensionY = 10;
        this.downDimensionY = 10;

        this.rectangleObject = true;
        this.label = "";
        this.scope = scope;

        this.scope[this.objectType].push(this);

        this.bitWidth = bitWidth || parseInt(prompt("Enter bitWidth"), 10) || 1;
        this.direction = dir;
        this.directionFixed = false;
        this.labelDirectionFixed = false;
//commented temporarily for testing
//        this.labelDirection = oppositeDirection[dir];
        this.orientationFixed = true;
        this.fixedBitWidth = false;
//commented temporarily for testing
//        scheduleUpdate();

        this.queueProperties = {
            inQueue: false,
            time: undefined,
            index: undefined,
        }

        alwaysResolve = false
        propagationDelay = 100
        overrideDirectionRotation = false;
        propagationDelayFixed = false;

    }

    // alwaysResolve = false
    // propagationDelay = 100
    flipBits(val) {
        return ((~val >>> 0) << (32 - this.bitWidth)) >>> (32 - this.bitWidth);
    }
    absX() {
        return this.x;
    }
    absY() {
        return this.y;
    }
    copyFrom(obj) {
        var properties = ["label", "labelDirection"];
        for (var i = 0; i < properties.length; i++) {
            if (obj[properties[i]] !== undefined)
                this[properties[i]] = obj[properties[i]];
        }
    }

    /* Methods to be Implemented for derivedClass
            saveObject(); //To generate JSON-safe data that can be loaded
            customDraw(); //This is to draw the custom design of the circuit(Optional)
            resolve(); // To execute digital logic(Optional)
            override isResolvable(); // custom logic for checking if module is ready
            override newDirection(dir) //To implement custom direction logic(Optional)
            newOrientation(dir) //To implement custom orientation logic(Optional)
        */

    // Method definitions

    updateScope(scope) {
        this.scope = scope;
        for (var i = 0; i < this.nodeList.length; i++)
            this.nodeList[i].scope = scope;
    }

    saveObject() {
        var data = {
            x: this.x,
            y: this.y,
            objectType: this.objectType,
            label: this.label,
            direction: this.direction,
            labelDirection: this.labelDirection,
            propagationDelay: this.propagationDelay,
            customData: this.customSave()
        }
        return data;

    }
    customSave() {
        return {
            values: {},
            nodes: {},
            constructorParamaters: [],
        }
    }

    checkHover() {

        if (simulationArea.mouseDown) return;
        for (var i = 0; i < this.nodeList.length; i++) {
            this.nodeList[i].checkHover();
        }
        if (!simulationArea.mouseDown) {
            if (simulationArea.hover == this) {
                this.hover = this.isHover();
                if (!this.hover) simulationArea.hover = undefined;
            } else if (!simulationArea.hover) {
                this.hover = this.isHover();
                if (this.hover) simulationArea.hover = this;
            } else {
                this.hover = false
            }
        }
    }

    //This sets the width and height of the element if its rectangular
    // and the reference point is at the center of the object.
    //width and height define the X and Y distance from the center.
    //Effectively HALF the actual width and height.
    // NOT OVERRIDABLE
    setDimensions(width, height) {
        this.leftDimensionX = this.rightDimensionX = width;
        this.downDimensionY = this.upDimensionY = height;
    }
    setWidth(width) {
        this.leftDimensionX = this.rightDimensionX = width;
    }
    setHeight(height) {
        this.downDimensionY = this.upDimensionY = height;
    }

    // The update method is used to change the parameters of the object on mouse click and hover.
    // Return Value: true if state has changed else false
    // NOT OVERRIDABLE

    // When true this.isHover() will not rotate bounds. To be used when bounds are set manually.
//    overrideDirectionRotation = false;

    startDragging() {
        this.oldx = this.x;
        this.oldy = this.y;
    }
    drag() {
        this.x = this.oldx + simulationArea.mouseX - simulationArea.mouseDownX;
        this.y = this.oldy + simulationArea.mouseY - simulationArea.mouseDownY;
    }
    update() {

        var update = false;

        update |= this.newElement;
        if (this.newElement) {
            if (this.centerElement) {
                this.x = Math.round((simulationArea.mouseX - (this.rightDimensionX - this.leftDimensionX) / 2) / 10) * 10;
                this.y = Math.round((simulationArea.mouseY - (this.downDimensionY - this.upDimensionY) / 2) / 10) * 10;
            } else {
                this.x = simulationArea.mouseX;
                this.y = simulationArea.mouseY;
            }

            if (simulationArea.mouseDown) {
                this.newElement = false;
                simulationArea.lastSelected = this;
            } else return;
        }

        for (var i = 0; i < this.nodeList.length; i++) {
            update |= this.nodeList[i].update();
        }

        if (!simulationArea.hover || simulationArea.hover == this)
            this.hover = this.isHover();

        if (!simulationArea.mouseDown) this.hover = false;


        if ((this.clicked || !simulationArea.hover) && this.isHover()) {
            this.hover = true;
            simulationArea.hover = this;
        } else if (!simulationArea.mouseDown && this.hover && this.isHover() == false) {
            if (this.hover) simulationArea.hover = undefined;
            this.hover = false;
        }

        if (simulationArea.mouseDown && (this.clicked)) {

            this.drag();
            if (!simulationArea.shiftDown && simulationArea.multipleObjectSelections.contains(this)) {
                for (var i = 0; i < simulationArea.multipleObjectSelections.length; i++) {
                    simulationArea.multipleObjectSelections[i].drag();
                }
            }

            update |= true;
        } else if (simulationArea.mouseDown && !simulationArea.selected) {

            this.startDragging();
            if (!simulationArea.shiftDown && simulationArea.multipleObjectSelections.contains(this)) {
                for (var i = 0; i < simulationArea.multipleObjectSelections.length; i++) {
                    simulationArea.multipleObjectSelections[i].startDragging();
                }
            }
            simulationArea.selected = this.clicked = this.hover;

            update |= this.clicked;
        } else {
            if (this.clicked) simulationArea.selected = false;
            this.clicked = false;
            this.wasClicked = false;
        }

        if (simulationArea.mouseDown && !this.wasClicked) {
            if (this.clicked) {
                this.wasClicked = true;
                if (this.click) this.click();
                if (simulationArea.shiftDown) {
                    simulationArea.lastSelected = undefined;
                    if (simulationArea.multipleObjectSelections.contains(this)) {
                        simulationArea.multipleObjectSelections.clean(this);
                    } else {
                        simulationArea.multipleObjectSelections.push(this);
                    }
                } else {
                    simulationArea.lastSelected = this;
                }
            }
        }

        return update;
    }

    fixDirection() {
        this.direction = fixDirection[this.direction] || this.direction;
        this.labelDirection = fixDirection[this.labelDirection] || this.labelDirection;
    }

    // The isHover method is used to check if the mouse is hovering over the object.
    // Return Value: true if mouse is hovering over object else false
    // NOT OVERRIDABLE
    isHover() {

        var mX = simulationArea.mouseXf - this.x;
        var mY = this.y - simulationArea.mouseYf;

        var rX = this.rightDimensionX;
        var lX = this.leftDimensionX;
        var uY = this.upDimensionY;
        var dY = this.downDimensionY;

        if (!this.directionFixed && !this.overrideDirectionRotation) {
            if (this.direction == "LEFT") {
                lX = this.rightDimensionX;
                rX = this.leftDimensionX
            } else if (this.direction == "DOWN") {
                lX = this.downDimensionY;
                rX = this.upDimensionY;
                uY = this.leftDimensionX;
                dY = this.rightDimensionX;
            } else if (this.direction == "UP") {
                lX = this.downDimensionY;
                rX = this.upDimensionY;
                dY = this.leftDimensionX;
                uY = this.rightDimensionX;
            }
        }

        return -lX <= mX && mX <= rX && -dY <= mY && mY <= uY;
    };

    setLabel(label) {
        this.label = label || ""
    }

//    propagationDelayFixed = false;

    //Method that draws the outline of the module and calls draw function on module Nodes.
    //NOT OVERRIDABLE
/*  Commented becuse octal literals not allowed in Node.js
    draw() {
        var ctx = simulationArea.context;
        this.checkHover();
        if (this.x * this.scope.scale + this.scope.ox < -this.rightDimensionX * this.scope.scale - 00 || this.x * this.scope.scale + this.scope.ox > width + this.leftDimensionX * this.scope.scale + 00 || this.y * this.scope.scale + this.scope.oy < -this.downDimensionY * this.scope.scale - 00 || this.y * this.scope.scale + this.scope.oy > height + 00 + this.upDimensionY * this.scope.scale) return;

        // Draws rectangle and highlights
        if (this.rectangleObject) {
            ctx.strokeStyle = "black";
            ctx.fillStyle = "white";
            ctx.lineWidth = correctWidth(3);
            ctx.beginPath();
            rect2(ctx, -this.leftDimensionX, -this.upDimensionY, this.leftDimensionX + this.rightDimensionX, this.upDimensionY + this.downDimensionY, this.x, this.y, [this.direction, "RIGHT"][+this.directionFixed]);
            if ((this.hover && !simulationArea.shiftDown) || simulationArea.lastSelected == this || simulationArea.multipleObjectSelections.contains(this)) ctx.fillStyle = "rgba(255, 255, 32,0.8)";
            ctx.fill();
            ctx.stroke();
        }
        if (this.label != "") {
            var rX = this.rightDimensionX;
            var lX = this.leftDimensionX;
            var uY = this.upDimensionY;
            var dY = this.downDimensionY;
            if (!this.directionFixed) {
                if (this.direction == "LEFT") {
                    lX = this.rightDimensionX;
                    rX = this.leftDimensionX
                } else if (this.direction == "DOWN") {
                    lX = this.downDimensionY;
                    rX = this.upDimensionY;
                    uY = this.leftDimensionX;
                    dY = this.rightDimensionX;
                } else if (this.direction == "UP") {
                    lX = this.downDimensionY;
                    rX = this.upDimensionY;
                    dY = this.leftDimensionX;
                    uY = this.rightDimensionX;
                }
            }

            if (this.labelDirection == "LEFT") {
                ctx.beginPath();
                ctx.textAlign = "right";
                ctx.fillStyle = "black";
                fillText(ctx, this.label, this.x - lX - 10, this.y + 5, 14);
                ctx.fill();
            } else if (this.labelDirection == "RIGHT") {
                ctx.beginPath();
                ctx.textAlign = "left";
                ctx.fillStyle = "black";
                fillText(ctx, this.label, this.x + rX + 10, this.y + 5, 14);
                ctx.fill();
            } else if (this.labelDirection == "UP") {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.fillStyle = "black";
                fillText(ctx, this.label, this.x, this.y + 5 - uY - 10, 14);
                ctx.fill();
            } else if (this.labelDirection == "DOWN") {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.fillStyle = "black";
                fillText(ctx, this.label, this.x, this.y + 5 + dY + 10, 14);
                ctx.fill();
            }
        }

        // calls the custom circuit design
        if (this.customDraw)
            this.customDraw();

        //draws nodes - Moved to renderCanvas
        // for (var i = 0; i < this.nodeList.length; i++)
        //     this.nodeList[i].draw();
    }
*/
    //method to delete object
    //OVERRIDE WITH CAUTION
    delete() {
        simulationArea.lastSelected = undefined;
        this.scope[this.objectType].clean(this); // CHECK IF THIS IS VALID
        if (this.deleteNodesWhenDeleted)
            this.deleteNodes();
        else
            for (var i = 0; i < this.nodeList.length; i++)
                if (this.nodeList[i].connections.length)
                    this.nodeList[i].converToIntermediate();
                else
                    this.nodeList[i].delete();
        this.deleted = true;
    }

    cleanDelete() {
        this.deleteNodesWhenDeleted = true;
        this.delete();
    }

    deleteNodes() {
        for (var i = 0; i < this.nodeList.length; i++)
            this.nodeList[i].delete();
    }

    //method to change direction
    //OVERRIDE WITH CAUTION
    newDirection(dir) {
        if (this.direction == dir) return;
        // Leave this for now
        if (this.directionFixed && this.orientationFixed) return;
        else if (this.directionFixed) {
            this.newOrientation(dir);
            return; // Should it return ?
        }

        // if (obj.direction == undefined) return;
        this.direction = dir;
        for (var i = 0; i < this.nodeList.length; i++) {
            this.nodeList[i].refresh();
        }

    }

    newLabelDirection(dir) {
        this.labelDirection = dir;
    }

    //Method to check if object can be resolved
    //OVERRIDE if necessary
    isResolvable() {
        if (this.alwaysResolve) return true;
        for (var i = 0; i < this.nodeList.length; i++)
            if (this.nodeList[i].type == 0 && this.nodeList[i].value == undefined) return false;
        return true;
    }

    //Method to change object Bitwidth
    //OVERRIDE if necessary
    newBitWidth(bitWidth) {
        if (this.fixedBitWidth) return;
        if (this.bitWidth == undefined) return;
        if (this.bitWidth < 1) return;
        this.bitWidth = bitWidth;
        for (var i = 0; i < this.nodeList.length; i++)
            this.nodeList[i].bitWidth = bitWidth;
    }

    //Method to change object delay
    //OVERRIDE if necessary
    changePropagationDelay(delay) {
        if (this.propagationDelayFixed) return;
        if (delay == undefined) return;
        if (delay == "") return;
        delay = parseInt(delay, 10)
        if (delay < 0) return;
        this.propagationDelay = delay;
    }

    //Dummy resolve function
    //OVERRIDE if necessary
    resolve() {

    }

    processVerilog() {
        var output_count = 0;
        for (var i = 0; i < this.nodeList.length; i++) {
            if (this.nodeList[i].type == NODE_OUTPUT) {
                this.nodeList[i].verilogLabel = this.nodeList[i].verilogLabel || (this.verilogLabel + "_" + (verilog.fixName(this.nodeList[i].label) || ("out_" + output_count)));
                if (this.objectType != "Input" && this.nodeList[i].connections.length > 0) {
                    if (this.scope.verilogWireList[this.bitWidth] != undefined) {
                        if (!this.scope.verilogWireList[this.bitWidth].contains(this.nodeList[i].verilogLabel))
                            this.scope.verilogWireList[this.bitWidth].push(this.nodeList[i].verilogLabel);
                    } else
                        this.scope.verilogWireList[this.bitWidth] = [this.nodeList[i].verilogLabel];
                }
                this.scope.stack.push(this.nodeList[i]);
                output_count++;
            }
        }
    }

    isVerilogResolvable() {

        var backupValues = []
        for (var i = 0; i < this.nodeList.length; i++) {
            backupValues.push(this.nodeList[i].value);
            this.nodeList[i].value = undefined;
        }

        for (var i = 0; i < this.nodeList.length; i++) {
            if (this.nodeList[i].verilogLabel) {
                this.nodeList[i].value = 1;
            }
        }

        var res = this.isResolvable();

        for (var i = 0; i < this.nodeList.length; i++) {
            this.nodeList[i].value = backupValues[i];
        }

        return res;
    }

    removePropagation() {
        for (var i = 0; i < this.nodeList.length; i++) {
            if (this.nodeList[i].type == NODE_OUTPUT) {
                if (this.nodeList[i].value !== undefined) {
                    this.nodeList[i].value = undefined;
                    simulationArea.simulationQueue.add(this.nodeList[i]);
                }
            }
        }
    }

    verilogName() {
        return this.verilogType || this.objectType;
    }

    generateVerilog() {

        var inputs = [];
        var outputs = [];


        for (var i = 0; i < this.nodeList.length; i++) {
            if (this.nodeList[i].type == NODE_INPUT) {
                inputs.push(this.nodeList[i]);
            } else {
                outputs.push(this.nodeList[i]);
            }
        }

        var list = outputs.concat(inputs);
        var res = this.verilogName() + " " + this.verilogLabel + " (" + list.map(function(x) {
            return x.verilogLabel
        }).join(",") + ");";

        return res;
    }
}
module.exports = CircuitElement