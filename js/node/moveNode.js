// node/moveNode.js

class MoveNode extends ANode {

    constructor() {
        super("move", "Move");
    }

    getInputs() {
        return 1;
    }

    getOutputs() {
        return 1;
    }

    getDefaultData() {
        return {
            moveType: "TP",
            speed: 1,
            completion: "WAIT_FOR_COMPLETION"
        };
    }

    render(data) {
        const moveType = ["TP", "WALK", "WALK_CUSTOM"].includes(data.moveType)
            ? data.moveType
            : "TP";
        const completion = ["WAIT_FOR_COMPLETION", "IMMEDIAT"].includes(data.completion)
            ? data.completion
            : "WAIT_FOR_COMPLETION";
        const speed = Math.max(0, Math.floor(Number(data.speed)) || 0);
        const customSpeed = moveType === "WALK_CUSTOM";

        return `
            <div class="move-node">
                <div class="move-title">Move</div>
                <label class="node-label">
                    Type
                    <select data-node-field="moveType">
                        <option value="TP" ${moveType === "TP" ? "selected" : ""}>TP</option>
                        <option value="WALK" ${moveType === "WALK" ? "selected" : ""}>WALK</option>
                        <option value="WALK_CUSTOM" ${moveType === "WALK_CUSTOM" ? "selected" : ""}>WALK_CUSTOM</option>
                    </select>
                </label>
                <label class="node-label">
                    Speed
                    <input
                        type="number"
                        min="0"
                        step="1"
                        data-node-field="speed"
                        data-field-type="int"
                        value="${speed}"
                        ${customSpeed ? "" : "disabled"}
                    >
                </label>
                <label class="node-label">
                    Completion
                    <select data-node-field="completion">
                        <option value="WAIT_FOR_COMPLETION" ${completion === "WAIT_FOR_COMPLETION" ? "selected" : ""}>WAIT_FOR_COMPLETION</option>
                        <option value="IMMEDIAT" ${completion === "IMMEDIAT" ? "selected" : ""}>IMMEDIAT</option>
                    </select>
                </label>
            </div>
        `;
    }
}

registerNode(new MoveNode());
