// node/eventNode.js

class EventNode extends ANode {

    constructor() {
        super("event", "Event");
    }

    getInputs() {
        return 1;
    }

    getOutputs() {
        return 0;
    }

    getDefaultData() {
        return {
            text: ""
        };
    }

    render(data) {
        return `
            <div class="event-node">
                <div class="event-title">Event</div>
                <textarea
                    class="node-string"
                    data-node-string
                    rows="2"
                >${escapeEventText(data.text)}</textarea>
            </div>
        `;
    }
}

function escapeEventText(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

registerNode(new EventNode());
