// node/waitSecNode.js

class WaitSecNode extends ANode {

    constructor() {
        super("waitSec", "Wait seconds");
    }

    getInputs() {
        return 1;
    }

    getOutputs() {
        return 1;
    }

    getDefaultData() {
        return {
            seconds: 0
        };
    }

    render(data) {
        return `
            <div class="wait-sec-node">
                <div class="wait-sec-title">Wait seconds</div>
                <label class="node-label">
                    Seconds
                    <input
                        type="number"
                        min="0"
                        step="1"
                        data-node-field="seconds"
                        data-field-type="int"
                        value="${Math.max(0, Math.floor(Number(data.seconds)) || 0)}"
                    >
                </label>
            </div>
        `;
    }
}

registerNode(new WaitSecNode());