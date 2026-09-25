// node/conditionNode.js

class ConditionNode extends ANode {

    constructor() {
        super("condition", "Condition");
    }

    getInputs() {
        return 1;
    }

    getOutputs() {
        return 2;
    }

    getOutputLabel(data, outputIndex) {
        return outputIndex === 1 ? "True" : "False";
    }

    getDefaultData() {
        return {
            condition: ""
        };
    }

    render(data) {
        return `
            <div class="condition-node">
                <div class="condition-title">Condition</div>
                <label class="node-label">
                    Condition
                    <input
                        type="text"
                        data-node-field="condition"
                        value="${escapeConditionText(data.condition)}"
                    >
                </label>
            </div>
        `;
    }
}

function escapeConditionText(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

registerNode(new ConditionNode());