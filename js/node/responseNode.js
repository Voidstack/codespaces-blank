// node/responseNode.js

class ResponseNode extends ANode {

    constructor() {
        super("response", "Response");
    }

    getInputs() {
        return 1;
    }

    getOutputs() {
        return 1;
    }

    getDefaultData() {
        return {
            text: ""
        };
    }

    render(data) {
        return `
            <div class="response-node">
                <div class="response-title">Response</div>
                <textarea
                    class="node-string"
                    data-node-string
                    rows="2"
                >${escapeResponseText(data.text)}</textarea>
            </div>
        `;
    }
}

function escapeResponseText(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

registerNode(new ResponseNode());
