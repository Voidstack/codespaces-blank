// node/nodeSpeech.js

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
            nmbResponse: 1,
            texts: [""]
        };
    }

    render(data) {
        return `
            <div class="speech-node">
                <div class="speech-title">Speech</div>
                <div class="speech-speaker">
                    ${data.speaker}
                </div>
            </div>
        `;
    }
}

registerNode(new SpeechNode());