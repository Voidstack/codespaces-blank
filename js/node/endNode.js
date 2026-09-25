// node/endNode.js

class EndNode extends ANode {

    constructor() {
        super("end", "End");
    }

    getInputs() {
        return 1;
    }

    getOutputs() {
        return 0;
    }

    getDefaultData() {
        return {};
    }

    render() {
        return `
            <div class="end-node">
                <div class="end-title">End</div>
            </div>
        `;
    }
}

registerNode(new EndNode());
