// node/speechNode.js

class SpeechNode extends ANode {

    constructor() {
        super("speech", "Speech");
    }

    getInputs() {
        return 1;
    }

    getOutputs(data) {
        const responseCount = this.getResponseCount(data);
        const closableOutput = data.isClosable === true ? 1 : 0;

        return responseCount + closableOutput;
    }

    getResponseCount(data) {
        return Math.max(1, Math.floor(Number(data.nmbResponse)) || 0);
    }

    getOutputLabel(data, outputIndex) {
        const requestedResponses = Math.max(
            0,
            Math.floor(Number(data.nmbResponse)) || 0
        );

        if (requestedResponses === 0 && outputIndex === 1) {
            return "Default";
        }

        if (outputIndex <= requestedResponses) {
            return `Response ${outputIndex}`;
        }

        if (data.isClosable === true) {
            return "Close";
        }

        return `Output ${outputIndex}`;
    }

    canConnectOutput(data, outputClass, targetType) {
        const outputIndex = Number(outputClass.replace("output_", ""));
        const responseCount = Math.max(
            0,
            Math.floor(Number(data.nmbResponse)) || 0
        );
        const isResponseOutput = responseCount > 0 && outputIndex <= responseCount;

        if (targetType === "response") {
            return isResponseOutput;
        }

        return !isResponseOutput;
    }

    getOutputMaxConnections(data, outputClass) {
        const outputIndex = Number(outputClass.replace("output_", ""));
        const responseCount = Math.max(
            0,
            Math.floor(Number(data.nmbResponse)) || 0
        );

        return responseCount > 0 && outputIndex <= responseCount
            ? 1
            : Infinity;
    }

    getDefaultData() {
        return {
            speaker: "",
            nmbResponse: 0,
            isClosable: false,
            texts: [""]
        };
    }

    render(data) {
        const speaker = data.speaker ?? "";
        const texts = Array.isArray(data.texts) && data.texts.length > 0
            ? data.texts
            : [""];

        return `
            <div class="speech-node">
                <div class="speech-title">Speech</div>
                <label class="speech-label">
                    Texts
                </label>
                <label class="node-label">
                    Speaker
                    <input
                        type="text"
                        data-node-field="speaker"
                        value="${escapeHtml(speaker)}"
                    >
                </label>
                <label class="speech-label" for="speech-output-count">
                    Outputs
                </label>
                <input
                    class="speech-output-count"
                    type="number"
                    min="0"
                    step="1"
                    value="${Math.max(0, Math.floor(Number(data.nmbResponse)) || 0)}"
                >
                <label class="speech-closable">
                    <input
                        class="speech-closable-toggle"
                        type="checkbox"
                        ${data.isClosable === true ? "checked" : ""}
                    >
                    Closable
                </label>
                <div class="speech-texts">
                    ${texts.map((text, index) => `
                        <div class="speech-text-row">
                            <textarea
                                class="speech-text"
                                data-speech-index="${index}"
                                rows="2"
                            >${escapeHtml(text)}</textarea>
                            <button
                                class="speech-remove"
                                type="button"
                                data-speech-remove="${index}"
                                aria-label="Remove text"
                            >-</button>
                        </div>
                    `).join("")}
                </div>
                <button class="speech-add" type="button">Add text</button>
            </div>
        `;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

registerNode(new SpeechNode());