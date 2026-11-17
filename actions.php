<?php

/**
 * @var PDO $pdo
 * @var int $uid
 * @var array $me
 */
if ($_SERVER["REQUEST_METHOD"] !== "POST") return;
hash_equals($_SESSION["csrf"], $_POST["csrf"] ?? "") || die("Bad token");

$page   = ($_POST["page"] ?? "") === "shared" ? "shared" : "personal";
$act    = $_POST["action"] ?? "";
$id     = (int)($_POST["id"] ?? 0);
$text   = trim($_POST["text"] ?? "");
$alt    = trim($_POST["alt"] ?? "");
$shared = isset($_POST["shared"]) ? 1 : 0;
$r      = strtotime($_POST["remind_at"] ?? "");
$remind = $r ? date("Y-m-d H:i:s", $r) : null;
$back   = "index.php?page=$page";

function saveImage(): ?string
{
    $f = $_FILES["image"] ?? null;
    if (!$f || $f["error"] === UPLOAD_ERR_NO_FILE) return null;
    $ext = $f["error"] === UPLOAD_ERR_OK && $f["size"] <= 2000000
        ? ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp"][mime_content_type($f["tmp_name"])] ?? null
        : null;
    if (!$ext) {
        $_SESSION["flash"] = "Image rejected (JPG/PNG/WebP, max 2 MB)";
        return null;
    }
    $name = bin2hex(random_bytes(8)) . ".$ext";
    return move_uploaded_file($f["tmp_name"], UPLOAD_DIR . $name) ? $name : null;
}
function dropImage(?string $n)
{
    if ($n) @unlink(UPLOAD_DIR . basename($n));
}

$todo = null;
if ($id) {
    $st = $pdo->prepare("SELECT * FROM todos WHERE id = ? AND user_id = ?");
    $st->execute([$id, $uid]);
    $todo = $st->fetch();
}

if (in_array($act, ["create", "update"]) && ($text === "" || mb_strlen($text) > 200)) {
    $_SESSION["flash"] = "Todo text is required (max 200 characters)";
    if ($act === "update") $back .= "&edit=$id";
} elseif ($act === "create") {
    $pdo->prepare("INSERT INTO todos (user_id, text, remind_at, shared, image, alt) VALUES (?,?,?,?,?,?)")
        ->execute([$uid, $text, $remind, $shared, saveImage(), $alt]);
    $_SESSION["flash"] ??= "Todo added";
} elseif ($todo) {
    if ($act === "update") {
        $img = $todo["image"];
        if ($new = saveImage()) {
            dropImage($img);
            $img = $new;
        } elseif (isset($_POST["remove_image"])) {
            dropImage($img);
            $img = null;
        }
        $pdo->prepare("UPDATE todos SET text=?, remind_at=?, shared=?, image=?, alt=? WHERE id=?")
            ->execute([$text, $remind, $shared, $img, $alt, $id]);
        $_SESSION["flash"] ??= "Todo updated";
    } elseif ($act === "toggle") {
        $pdo->prepare("UPDATE todos SET done = 1 - done WHERE id = ?")->execute([$id]);
    } elseif ($act === "delete") {
        dropImage($todo["image"]);
        $pdo->prepare("DELETE FROM todos WHERE id = ?")->execute([$id]);
        $_SESSION["flash"] = "Todo deleted";
    }
}
header("Location: $back");
exit;
