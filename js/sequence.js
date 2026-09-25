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


async function init() {
    await loadNodes();
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