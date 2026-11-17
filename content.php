<?php

/** @var PDO $pdo @var int $uid @var array $me @var string $page */
?>
<section aria-labelledby="list-heading">
    <h2 id="list-heading"><?= $page === "shared" ? "Shared todos" : "My todos" ?></h2>

    <?php if (!empty($_SESSION["flash"])): ?>
        <p class="flash" role="alert"><?= e($_SESSION["flash"]) ?></p>
        <?php unset($_SESSION["flash"]); ?>
    <?php endif ?>

    <?php if (!$todos): ?><p>No todos yet. Add one using the form.</p><?php endif ?>

    <ul id="todo-list">
        <?php foreach ($todos as $t):
            $mine = $t["user_id"] == $uid;
            $remind = $t["remind_at"] ? date("Y-m-d\TH:i", strtotime($t["remind_at"])) : null; ?>
            <li class="todo-item<?= $t["done"] ? " done" : "" ?>" <?php if ($mine && $remind && !$t["done"]): ?> data-id="<?= (int)$t["id"] ?>" data-text="<?= e($t["text"]) ?>" data-remind="<?= $remind ?>" <?php endif ?>>
                <span class="text"><?= e($t["text"]) ?><?php if ($t["done"]): ?><span class="sr-only"> (done)</span><?php endif ?></span>
                <?php if ($page === "shared"): ?><span class="meta">by <?= e($t["owner"]) ?></span><?php endif ?>
                <?php if ($remind): ?><time class="meta" datetime="<?= $remind ?>">Reminder: <?= date("d M Y H:i", strtotime($t["remind_at"])) ?></time><?php endif ?>
                <?php if ($t["image"]): ?><img src="uploads/<?= e($t["image"]) ?>" alt="<?= e($t["alt"]) ?>"><?php endif ?>

                <?php if ($mine): $sr = '<span class="sr-only">: ' . e($t["text"]) . '</span>'; ?>
                    <div class="actions">
                        <form method="post"><?= fields("toggle", $t["id"]) ?><button class="btn btn-secondary"><?= $t["done"] ? "Undo" : "Done" ?><?= $sr ?></button></form>
                        <a class="btn btn-secondary" href="index.php?page=<?= e($page) ?>&amp;edit=<?= (int)$t["id"] ?>">Edit<?= $sr ?></a>
                        <form method="post" onsubmit="return confirm('Delete this todo?')"><?= fields("delete", $t["id"]) ?><button class="btn btn-secondary">Delete<?= $sr ?></button></form>
                    </div>
                <?php endif ?>
            </li>
        <?php endforeach ?>
    </ul>
</section>
