<?php

/** @var PDO $pdo @var int $uid @var array $me @var string $page */
?>

<nav aria-label="Main menu">
    <p>Hi, <strong><?= e($me["name"]) ?></strong></p>
    <ul>
        <?php foreach (["personal" => "Personal", "shared" => "Shared"] as $k => $label): ?>
            <li><a href="index.php?page=<?= $k ?>" <?= $page === $k ? ' aria-current="page"' : "" ?>><?= $label ?></a></li>
        <?php endforeach ?>
    </ul>

    <form method="get">
        <input type="hidden" name="page" value="<?= e($page) ?>">
        <label for="user">Switch user (demo)</label>
        <select id="user" name="user">
            <?php foreach ($pdo->query("SELECT id, name FROM users") as $u): ?>
                <option value="<?= (int)$u["id"] ?>" <?= $u["id"] == $uid ? " selected" : "" ?>><?= e($u["name"]) ?></option>
            <?php endforeach ?>
        </select>
        <button class="btn btn-secondary">Switch</button>
    </form>

    <button type="button" id="install-btn" class="btn" hidden>Install app</button>
    <button type="button" id="notif-btn" class="btn btn-secondary">Enable notifications</button>
</nav>
