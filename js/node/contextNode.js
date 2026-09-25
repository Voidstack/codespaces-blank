// node/contextNode.js

class ContextNode extends ANode {

    constructor() {
        super("context", "Event/Context");
    }

    getInputs() {
        return 1;
    }

    getOutputs() {
        return 1;
    }

    getDefaultData() {
        return {
            action: "HANDLE_PLAYER"
        };
    }

    render(data) {
        const action = ["HANDLE_PLAYER", "RELEASE_PLAYER"].includes(data?.action)
            ? data.action
            : "HANDLE_PLAYER";

        return `
            <div class="context-node">
                <div class="context-title">Context</div>
                <label class="node-label">
                    Action
                    <select data-node-field="action">
                        <option value="HANDLE_PLAYER" ${action === "HANDLE_PLAYER" ? "selected" : ""}>HANDLE_PLAYER</option>
                        <option value="RELEASE_PLAYER" ${action === "RELEASE_PLAYER" ? "selected" : ""}>RELEASE_PLAYER</option>
                    </select>
                </label>
            </div>
        `;
    }
}

registerNode(new ContextNode());