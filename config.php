<?php
session_start();
const UPLOAD_DIR = __DIR__ . "/uploads/";

$pdo = new PDO("pgsql:host=localhost;port=5432;dbname=todo_app", "todo", "todo123", [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
is_dir(UPLOAD_DIR) || mkdir(UPLOAD_DIR, 0755);
$_SESSION["csrf"] ??= bin2hex(random_bytes(16));

$st = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$st->execute([(int)($_GET["user"] ?? $_SESSION["uid"] ?? 1)]);
$me  = $st->fetch() ?: die("Unknown user");
$uid = $_SESSION["uid"] = (int)$me["id"];

function e($s)
{
    return htmlspecialchars((string)$s, ENT_QUOTES);
}

function fields($act, $id = 0)
{
    global $page;
    return '<input type="hidden" name="csrf" value="' . $_SESSION["csrf"] . '">'
        . '<input type="hidden" name="page" value="' . e($page) . '">'
        . '<input type="hidden" name="id" value="' . (int)$id . '">'
        . '<input type="hidden" name="action" value="' . e($act) . '">';
}
