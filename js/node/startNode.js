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
        return {
            handlePlayer: true
        };
    }

    render(data) {
        return `
            <div class="start-node">
                <div class="start-title">Start</div>
                <label class="speech-closable">
                    Handle player
                    <input
                        type="checkbox"
                        data-node-field="handlePlayer"
                        ${data?.handlePlayer !== false ? "checked" : ""}
                    >
                </label>
            </div>
        `;
    }
}

registerNode(new StartNode());
