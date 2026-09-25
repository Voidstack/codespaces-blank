// node/cameraNode.js

class CameraNode extends ANode {

    constructor() {
        super("camera", "Camera");
    }

    getInputs() {
        return 1;
    }

    getOutputs() {
        return 1;
    }

    getInputLabel() {
        return "In";
    }

    getOutputLabel() {
        return "Out";
    }

    getDefaultData() {
        return {
            action: "FOCUS",
            speaker: ""
        };
    }

    render(data) {
        const action = ["FOCUS", "ZOOM_IN", "RELEASE"].includes(data.action)
            ? data.action
            : "FOCUS";
        const speaker = data.speaker ?? "";

        return `
            <div class="camera-node">
                <div class="camera-title">Camera</div>
                <label class="node-label">
                    Action
                    <select data-node-field="action">
                        <option value="FOCUS" ${action === "FOCUS" ? "selected" : ""}>FOCUS</option>
                        <option value="ZOOM_IN" ${action === "ZOOM_IN" ? "selected" : ""}>ZOOM_IN</option>
                        <option value="RELEASE" ${action === "RELEASE" ? "selected" : ""}>RELEASE</option>
                    </select>
                </label>
                <label class="node-label">
                    Speaker
                    <input
                        type="text"
                        data-node-field="speaker"
                        value="${escapeCameraText(speaker)}"
                    >
                </label>
            </div>
        `;
    }
}

function escapeCameraText(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

registerNode(new CameraNode());