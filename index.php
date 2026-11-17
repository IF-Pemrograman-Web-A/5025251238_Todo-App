<?php

/** @var PDO $pdo @var int $uid @var array $me @var string $page */
require "config.php";
require "actions.php";
$page = ($_GET["page"] ?? "personal") === "shared" ? "shared" : "personal";

$sql = "SELECT t.*, u.name AS owner FROM todos t JOIN users u ON u.id = t.user_id WHERE "
    . ($page === "shared" ? "t.shared = 1" : "t.shared = 0 AND t.user_id = ?")
    . " ORDER BY t.created_at, t.id";
$st = $pdo->prepare($sql);
$st->execute($page === "shared" ? [] : [$uid]);
$todos = $st->fetchAll();

$edit = null;
foreach ($todos as $t) if ($t["id"] == ($_GET["edit"] ?? 0) && $t["user_id"] == $uid) $edit = $t;
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ToDo-app</title>
    <script>
        let t;
        try {
            t = localStorage.getItem("todo-theme");
        } catch {}
        if (t !== "light" && t !== "dark") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.dataset.theme = t;
    </script>
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#0b5f80">
    <link rel="apple-touch-icon" href="icons/icon-192.png">
    <link rel="stylesheet" href="style.css">
    <script src="script.js" defer></script>
</head>

<body>
    <a href="#main" class="skip-link">Skip to main content</a>
    <header>
        <h1>ToDo-app</h1>
        <button type="button" id="theme-toggle" class="btn btn-secondary" aria-pressed="false">Dark mode</button>
    </header>

    <div class="app">
        <?php include "menubar.php"; ?>
        <main id="main" class="wrapper" tabindex="-1">
            <?php include "content.php"; ?>
            <?php include "form.php"; ?>
        </main>
    </div>

    <div id="status" class="sr-only" role="status" aria-live="polite"></div>
</body>

</html>
