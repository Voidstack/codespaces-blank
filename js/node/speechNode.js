// node/speechNode.js

class SpeechNode extends ANode {

    constructor() {
        super("speech", "Speech");
    }

    getInputs() {
        return 1;
    }

    getOutputs(data) {
        return Math.max(1, Number(data.nmbResponse) || 1);
    }

    getDefaultData() {
        return {
            speaker: "",
            texts: [""]
        };
    }

    render(data) {
        const texts = Array.isArray(data.texts) && data.texts.length > 0
            ? data.texts
            : [""];

        return `
            <div class="speech-node">
                <div class="speech-title">Speech</div>
                <label class="speech-label">
                    Texts
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