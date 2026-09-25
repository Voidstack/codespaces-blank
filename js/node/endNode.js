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
            releaseCam: true
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
            </div>
        `;
    }
}

registerNode(new EndNode());
