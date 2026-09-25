// node/startNode.js

class StartNode extends ANode {

    constructor() {
        super("start", "Start");
    }

    getInputs() {
        return 0;
    }

    getOutputs() {
        return 1;
    }

    getDefaultData() {
        return {};
    }

    render() {
        return `
            <div class="start-node">
                <div class="start-title">Start</div>
            </div>
        `;
    }
}

registerNode(new StartNode());
