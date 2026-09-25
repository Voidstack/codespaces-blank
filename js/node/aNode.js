// node/aNode.js

class ANode {

    constructor(type, label) {
        this.type = type;
        this.label = label;
    }

    getType() {
        return this.type;
    }

    getLabel() {
        return this.label.split("/").at(-1);
    }

    getCategory() {
        return this.getMenuPath()[0];
    }

    getMenuPath() {
        const path = this.label.split("/").filter(Boolean);

        return path;
    }

    getInputs() {
        return 1;
    }

    getOutputs(data) {
        return 1;
    }

    getInputLabel(data, inputIndex) {
        return `Input ${inputIndex}`;
    }

    getOutputLabel(data, outputIndex) {
        return `Output ${outputIndex}`;
    }

    canConnectOutput(data, outputClass, targetType) {
        return true;
    }

    getOutputMaxConnections(data, outputClass) {
        return Infinity;
    }

    getDefaultData() {
        return {};
    }

    render(data) {
        return `<div>${this.label}</div>`;
    }

    create(editor, x, y) {
        const data = this.getDefaultData();

        return editor.addNode(
            this.type,
            this.getInputs(data),
            this.getOutputs(data),
            x,
            y,
            this.type,
            data,
            this.render(data),
            false
        );
    }
}