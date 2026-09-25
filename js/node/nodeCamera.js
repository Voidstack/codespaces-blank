// node/nodeCamera.js

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

    getDefaultData() {
        return {};
    }

    render(data) {
        return `
            <div class="camera-node">
                <div class="camera-title">Camera</div>
            </div>
        `;
    }
}

registerNode(new CameraNode());