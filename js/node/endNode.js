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
        return {
            releaseCam: true,
            releasePlayer: true
        };
    }

    render(data) {
        const releaseCam = data?.releaseCam !== false;

        return `
            <div class="end-node">
                <div class="end-title">End</div>
                <label class="speech-closable">
                    <input
                        type="checkbox"
                        data-node-field="releaseCam"
                        ${releaseCam ? "checked" : ""}
                    >
                    Release camera
                </label>
                <label class="speech-closable">
                    Release player
                    <input
                        type="checkbox"
                        data-node-field="releasePlayer"
                        ${data?.releasePlayer !== false ? "checked" : ""}
                    >
                </label>
            </div>
        `;
    }
}

registerNode(new EndNode());
