const nodeRegistry = new Map();


function registerNode(node) {
    nodeRegistry.set(
        node.getType(),
        node
    );
}


async function loadNodes() {

    const response = await fetch(
        "./php/sequence.php?action=list-nodes"
    );

    if (!response.ok) {
        throw new Error(
            `Unable to list nodes (${response.status})`
        );
    }

    const files = await response.json();

    for (const file of files) {

        await new Promise((resolve, reject) => {

            const script =
                document.createElement("script");

            script.src =
                `./js/node/${file}`;

            script.onload = resolve;

            script.onerror = () => {
                reject(
                    new Error(
                        `Unable to load node: ${file}`
                    )
                );
            };

            document.head.appendChild(script);
        });
    }
}


const editorElement =
    document.getElementById("editor");

const editor =
    new Drawflow(editorElement);

editor.reroute = true;
editor.start();


async function listGraphs() {

    const response = await fetch(
        "./php/sequence.php?action=list"
    );

    if (!response.ok) {
        throw new Error(
            `Unable to list graphs (${response.status})`
        );
    }

    return await response.json();
}


async function loadGraph(name) {

    const response = await fetch(
        `./php/sequence.php?action=load&name=${encodeURIComponent(name)}`
    );

    if (!response.ok) {
        throw new Error(
            `Unable to load graph (${response.status})`
        );
    }

    const graph = await response.json();

    editor.clear();
    editor.import(graph);
}


async function saveGraph(name) {

    const graph = editor.export();

    const response = await fetch(
        "./php/sequence.php",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "save",
                name: name,
                graph: graph
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `Unable to save graph (${response.status})`
        );
    }
}


async function deleteGraph(name) {

    const response = await fetch(
        "./php/sequence.php",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "delete",
                name: name
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `Unable to delete graph (${response.status})`
        );
    }
}


function closeContextMenu() {

    const menu =
        document.getElementById("context-menu");

    if (menu) {
        menu.remove();
    }
}


editorElement.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

        closeContextMenu();

        const menu =
            document.createElement("div");

        menu.id =
            "context-menu";

        menu.className =
            "context-menu";


        for (const node of nodeRegistry.values()) {

            const item =
                document.createElement("div");

            item.className =
                "context-menu-item";

            item.textContent =
                node.getLabel();


            item.addEventListener(
                "click",
                () => {

                    const rect =
                        editorElement.getBoundingClientRect();

                    const x =
                        event.clientX - rect.left;

                    const y =
                        event.clientY - rect.top;


                    node.create(
                        editor,
                        x,
                        y
                    );

                    closeContextMenu();
                }
            );


            menu.appendChild(item);
        }


        menu.style.left =
            `${event.clientX}px`;

        menu.style.top =
            `${event.clientY}px`;

        document.body.appendChild(menu);
    }
);


document.addEventListener(
    "click",
    closeContextMenu
);


function setGraphStatus(message, isError = false) {
    const status = document.getElementById("graph-status");

    if (status) {
        status.textContent = message;
        status.classList.toggle("error", isError);
    }
}


function exportGraphToFile() {
    const graph = editor.export();
    const blob = new Blob(
        [JSON.stringify(graph, null, 2)],
        { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sequence.graph.json";
    link.click();
    URL.revokeObjectURL(url);

    setGraphStatus("Graphe exporté");
}


async function importGraphFromFile(file) {
    const graph = JSON.parse(await file.text());

    if (!graph || typeof graph !== "object" || !graph.drawflow) {
        throw new Error("Le fichier ne contient pas un graphe Drawflow valide");
    }

    editor.clear();
    editor.import(graph);
    setGraphStatus("Graphe importé");
}


document.getElementById("export-graph").addEventListener(
    "click",
    exportGraphToFile
);


const importFile = document.getElementById("import-file");

document.getElementById("import-graph").addEventListener(
    "click",
    () => importFile.click()
);

importFile.addEventListener(
    "change",
    async () => {
        const file = importFile.files[0];

        if (!file) {
            return;
        }

        try {
            await importGraphFromFile(file);
        } catch (error) {
            setGraphStatus(`Import impossible : ${error.message}`, true);
        } finally {
            importFile.value = "";
        }
    }
);


function getSpeechNodeFromEvent(event) {
    const speechField = event.target.closest(".speech-text");
    const nodeElement = speechField?.closest(".drawflow-node");

    if (!speechField || !nodeElement) {
        return null;
    }

    return {
        id: Number(nodeElement.dataset.id),
        element: nodeElement
    };
}


function updateSpeechData(node) {
    const data = editor.getNodeFromId(node.id).data;

    data.texts = [
        ...node.element.querySelectorAll(".speech-text")
    ].map(field => field.value);

    editor.updateNodeDataFromId(node.id, data);
}


editorElement.addEventListener(
    "input",
    event => {
        const node = getSpeechNodeFromEvent(event);

        if (node) {
            updateSpeechData(node);
        }
    }
);


editorElement.addEventListener(
    "click",
    event => {
        const addButton = event.target.closest(".speech-add");
        const removeButton = event.target.closest(".speech-remove");
        const nodeElement = event.target.closest(".drawflow-node");

        if ((!addButton && !removeButton) || !nodeElement) {
            return;
        }

        const nodeId = Number(nodeElement.dataset.id);
        const nodeData = editor.getNodeFromId(nodeId).data;
        const texts = Array.isArray(nodeData.texts) ? nodeData.texts : [""];

        if (addButton) {
            texts.push("");
        }

        if (removeButton && texts.length > 1) {
            texts.splice(Number(removeButton.dataset.speechRemove), 1);
        }

        nodeData.texts = texts;
        editor.updateNodeDataFromId(nodeId, nodeData);

        const speechNode = nodeRegistry.get("speech");
        const content = nodeElement.querySelector(".drawflow_content_node");

        if (speechNode && content) {
            content.innerHTML = speechNode.render(nodeData);
        }
    }
);


async function init() {
    await loadNodes();

    const cameraNode = nodeRegistry.get("camera");

    if (cameraNode && editor.drawflow.Home?.data) {
        cameraNode.create(editor, 120, 100);
    }
}


init().catch(error => {

    const debug =
        document.getElementById("debug");

    if (debug) {
        debug.textContent =
            `ERROR: ${error.message}`;
    }

    console.error(error);
});