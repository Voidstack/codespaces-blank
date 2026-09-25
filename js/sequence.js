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


editorElement.addEventListener(
    "wheel",
    event => {
        if (event.target.closest("textarea, input, button")) {
            return;
        }

        event.preventDefault();

        if (event.deltaY < 0 && editor.zoom < editor.zoom_max) {
            editor.zoom_in();
        }

        if (event.deltaY > 0 && editor.zoom > editor.zoom_min) {
            editor.zoom_out();
        }
    },
    { passive: false }
);


function updateNodePortLabels(nodeId) {
    const nodeData = editor.getNodeFromId(nodeId);
    const nodeElement = document.getElementById(`node-${nodeId}`);
    const nodeDefinition = nodeData && nodeRegistry.get(nodeData.name);

    if (!nodeData || !nodeDefinition || !nodeElement) {
        return;
    }

    nodeElement.querySelectorAll(".inputs .input").forEach(input => {
        const inputIndex = Number(
            [...input.classList]
                .find(className => className.startsWith("input_"))
                ?.replace("input_", "")
        );
        const label = nodeDefinition.getInputLabel(
            nodeData.data,
            inputIndex
        );

        input.dataset.label = label;
        input.title = label;
    });

    nodeElement.querySelectorAll(".outputs .output").forEach(output => {
        const outputIndex = Number(
            [...output.classList]
                .find(className => className.startsWith("output_"))
                ?.replace("output_", "")
        );
        const label = nodeDefinition.getOutputLabel(
            nodeData.data,
            outputIndex
        );

        output.dataset.label = label;
        output.title = label;
    });
}


editor.on(
    "connectionCreated",
    connection => {
        const sourceId = Number(connection.output_id);
        const targetId = Number(connection.input_id);
        const source = editor.getNodeFromId(sourceId);
        const target = editor.getNodeFromId(targetId);
        const sourceDefinition = source && nodeRegistry.get(source.name);

        if (!source || !target || !sourceDefinition) {
            return;
        }

        const connectionAllowed = sourceDefinition.canConnectOutput(
            source.data,
            connection.output_class,
            target.name
        );

        if (!connectionAllowed) {
            editor.removeSingleConnection(
                sourceId,
                targetId,
                connection.output_class,
                connection.input_class
            );
        }

        const connections = source.outputs[connection.output_class]?.connections || [];
        const maxConnections = sourceDefinition.getOutputMaxConnections(
            source.data,
            connection.output_class
        );

        if (connections.length > maxConnections) {
            editor.removeSingleConnection(
                sourceId,
                targetId,
                connection.output_class,
                connection.input_class
            );
        }
    }
);


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

    document.querySelectorAll(".drawflow-node").forEach(nodeElement => {
        const nodeId = getNodeId(nodeElement);

        updateNodePortLabels(nodeId);
    });
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


function addNodeToMenuTree(tree, node) {
    let currentTree = tree;

    for (const part of node.getMenuPath()) {
        if (!currentTree.has(part)) {
            currentTree.set(part, {
                children: new Map(),
                node: null
            });
        }

        const entry = currentTree.get(part);

        if (part === node.getMenuPath().at(-1)) {
            entry.node = node;
        }

        currentTree = entry.children;
    }
}


function createNodeMenuItem(node, event) {
    const item = document.createElement("div");

    item.className = "context-menu-item";
    item.textContent = node.getLabel();

    item.addEventListener(
        "click",
        () => {
            const rect = editorElement.getBoundingClientRect();
            const createdNodeId = node.create(
                editor,
                event.clientX - rect.left,
                event.clientY - rect.top
            );

            updateNodePortLabels(createdNodeId);
            closeContextMenu();
        }
    );

    return item;
}


function createNodeMenuLevel(tree, event, isRoot = false) {
    const level = document.createElement("div");

    level.className = isRoot
        ? "context-menu-level context-menu-root"
        : "context-menu-level context-menu-submenu";

    for (const [label, entry] of tree) {
        if (entry.node && entry.children.size === 0) {
            level.appendChild(createNodeMenuItem(entry.node, event));
            continue;
        }

        const folder = document.createElement("div");

        folder.className = "context-menu-folder";
        folder.textContent = label;
        folder.appendChild(createNodeMenuLevel(entry.children, event));
        level.appendChild(folder);
    }

    return level;
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


        const menuTree = new Map();

        for (const node of nodeRegistry.values()) {
            addNodeToMenuTree(menuTree, node);
        }

        menu.appendChild(createNodeMenuLevel(menuTree, event, true));


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

    document.querySelectorAll(".drawflow-node").forEach(nodeElement => {
        const nodeId = getNodeId(nodeElement);

        updateNodePortLabels(nodeId);
    });

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
        id: getNodeId(nodeElement),
        element: nodeElement
    };
}


function getNodeId(nodeElement) {
    return Number(nodeElement.id.replace("node-", ""));
}


function updateSpeechData(node) {
    const nodeData = editor.getNodeFromId(node.id);

    if (!nodeData) {
        return;
    }

    const data = nodeData.data;

    data.texts = [
        ...node.element.querySelectorAll(".speech-text")
    ].map(field => field.value);

    editor.updateNodeDataFromId(node.id, data);
}


function updateNodeOutputs(nodeId, requestedCount) {
    const nodeData = editor.getNodeFromId(nodeId);

    if (!nodeData) {
        return;
    }

    let currentCount = Object.keys(nodeData.outputs).length;

    while (currentCount < requestedCount) {
        editor.addNodeOutput(nodeId);
        currentCount += 1;
    }

    while (currentCount > requestedCount) {
        editor.removeNodeOutput(nodeId, `output_${currentCount}`);
        currentCount -= 1;
    }
}


function getNodeFromTarget(target) {
    const nodeElement = target.closest(".drawflow-node");

    if (!nodeElement) {
        return null;
    }

    return {
        id: getNodeId(nodeElement),
        element: nodeElement,
        data: editor.getNodeFromId(getNodeId(nodeElement))
    };
}


function refreshNodeContent(node) {
    const nodeDefinition = nodeRegistry.get(node.data.name);
    const content = node.element.querySelector(".drawflow_content_node");

    if (!nodeDefinition || !content) {
        return;
    }

    content.innerHTML = nodeDefinition.render(node.data.data);
    updateNodePortLabels(node.id);
}


function updateNodeField(event) {
    const field = event.target.closest("[data-node-field]");
    const node = field && getNodeFromTarget(field);

    if (!field || !node?.data) {
        return;
    }

    const value = field.type === "checkbox"
        ? field.checked
        : field.dataset.fieldType === "int"
            ? Math.max(0, Math.floor(Number(field.value)) || 0)
            : field.value;

    if (field.type === "checkbox") {
        field.checked = value;
    } else {
        field.value = value;
    }
    node.data.data[field.dataset.nodeField] = value;
    editor.updateNodeDataFromId(node.id, node.data.data);

    if (
        node.data.name === "move" &&
        field.dataset.nodeField === "moveType"
    ) {
        refreshNodeContent(node);
    }
}


editorElement.addEventListener(
    "pointerdown",
    event => {
        if (event.target.closest("textarea, input, button")) {
            event.stopPropagation();
        }
    },
    true
);


editorElement.addEventListener(
    "mousedown",
    event => {
        if (event.target.closest("textarea, input, button")) {
            event.stopPropagation();
        }
    },
    true
);


editorElement.addEventListener(
    "input",
    event => {
        updateNodeField(event);

        const node = getSpeechNodeFromEvent(event);

        if (node) {
            updateSpeechData(node);
        }

        const stringField = event.target.closest("[data-node-string]");
        const stringNode = stringField && getNodeFromTarget(stringField);

        if (stringNode?.data) {
            stringNode.data.data.text = stringField.value;
            editor.updateNodeDataFromId(stringNode.id, stringNode.data.data);
        }
    }
);


editorElement.addEventListener(
    "change",
    event => {
        updateNodeField(event);

        const outputField = event.target.closest(".speech-output-count");
        const closableField = event.target.closest(".speech-closable-toggle");

        if (!outputField && !closableField) {
            return;
        }

        const node = getNodeFromTarget(outputField || closableField);
        const count = outputField
            ? Math.max(0, Math.floor(Number(outputField.value)) || 0)
            : node?.data?.data.nmbResponse || 0;

        if (node?.data) {
            if (outputField) {
                outputField.value = count;
                node.data.data.nmbResponse = count;
            }

            if (closableField) {
                node.data.data.isClosable = closableField.checked;
            }

            editor.updateNodeDataFromId(node.id, node.data.data);

            const speechNode = nodeRegistry.get("speech");
            const outputCount = speechNode.getOutputs(node.data.data);

            updateNodeOutputs(node.id, outputCount);
            updateNodePortLabels(node.id);
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

        event.preventDefault();
        event.stopPropagation();

        const nodeId = getNodeId(nodeElement);
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

        updateNodePortLabels(nodeId);
    },
    true
);


async function init() {
    await loadNodes();

    const cameraNode = nodeRegistry.get("camera");

    if (cameraNode && editor.drawflow.Home?.data) {
        const cameraNodeId = cameraNode.create(editor, 120, 100);
        updateNodePortLabels(cameraNodeId);
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