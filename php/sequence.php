<?php

$graphsDirectory = __DIR__ . "/../graphs";
$nodesDirectory = __DIR__ . "/../js/node";


if (!is_dir($graphsDirectory)) {
    mkdir($graphsDirectory, 0755, true);
}


/*
 * Sanitize graph name.
 */
function sanitizeName($name)
{
    $name = basename($name);

    return preg_replace(
        '/[^a-zA-Z0-9 _-]/',
        '',
        $name
    );
}


/*
 * GET actions
 */
$action = $_GET["action"] ?? null;


/*
 * List node scripts.
 */
if ($action === "list-nodes") {

    if (!is_dir($nodesDirectory)) {
        http_response_code(500);

        header("Content-Type: application/json");

        echo json_encode([
            "error" => "Node directory not found"
        ]);

        exit;
    }

    $files = scandir($nodesDirectory);

    $nodes = [];

    foreach ($files as $file) {

        if (
            $file === "." ||
            $file === ".." ||
            $file === "aNode.js" ||
            pathinfo($file, PATHINFO_EXTENSION) !== "js"
        ) {
            continue;
        }

        $nodes[] = $file;
    }

    sort($nodes);

    header("Content-Type: application/json");

    echo json_encode($nodes);

    exit;
}


/*
 * List graphs.
 */
if ($action === "list") {

    $files = glob(
        $graphsDirectory . "/*.graph"
    );

    $graphs = [];

    foreach ($files as $file) {

        $graphs[] =
            pathinfo(
                $file,
                PATHINFO_FILENAME
            );
    }

    sort($graphs);

    header("Content-Type: application/json");

    echo json_encode($graphs);

    exit;
}


/*
 * Load graph.
 */
if ($action === "load") {

    $name = sanitizeName(
        $_GET["name"] ?? ""
    );

    if ($name === "") {
        http_response_code(400);
        exit;
    }

    $file =
        $graphsDirectory .
        "/" .
        $name .
        ".graph";

    if (!file_exists($file)) {
        http_response_code(404);
        exit;
    }

    header("Content-Type: application/json");

    echo file_get_contents($file);

    exit;
}


/*
 * POST actions
 */
$input = json_decode(
    file_get_contents("php://input"),
    true
);

$action = $input["action"] ?? null;


/*
 * Save graph.
 */
if ($action === "save") {

    $name = sanitizeName(
        $input["name"] ?? ""
    );

    $graph = $input["graph"] ?? null;

    if (
        $name === "" ||
        $graph === null
    ) {
        http_response_code(400);
        exit;
    }

    $file =
        $graphsDirectory .
        "/" .
        $name .
        ".graph";

    $json = json_encode(
        $graph,
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE
    );

    if ($json === false) {
        http_response_code(500);
        exit;
    }

    if (
        file_put_contents(
            $file,
            $json,
            LOCK_EX
        ) === false
    ) {
        http_response_code(500);
        exit;
    }

    header("Content-Type: application/json");

    echo json_encode([
        "success" => true
    ]);

    exit;
}


/*
 * Delete graph.
 */
if ($action === "delete") {

    $name = sanitizeName(
        $input["name"] ?? ""
    );

    if ($name === "") {
        http_response_code(400);
        exit;
    }

    $file =
        $graphsDirectory .
        "/" .
        $name .
        ".graph";

    if (
        file_exists($file) &&
        !unlink($file)
    ) {
        http_response_code(500);
        exit;
    }

    header("Content-Type: application/json");

    echo json_encode([
        "success" => true
    ]);

    exit;
}


/*
 * Invalid action.
 */
http_response_code(400);

header("Content-Type: application/json");

echo json_encode([
    "error" => "Invalid action"
]);