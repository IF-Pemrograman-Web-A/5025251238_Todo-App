<?php

/** @var PDO $pdo @var int $uid @var array $me @var string $page */
?>
<section aria-labelledby="form-heading">
    <h2 id="form-heading"><?= $edit ? "Edit todo" : "Add todo" ?></h2>

    <form method="post" enctype="multipart/form-data">
        <?= fields($edit ? "update" : "create", $edit["id"] ?? 0) ?>

        <div class="field">
            <label for="text">Todo (required)</label>
            <input type="text" id="text" name="text" maxlength="200" required autocomplete="off" value="<?= e($edit["text"] ?? "") ?>">
        </div>

        <div class="field">
            <label for="remind">Remind me at (optional)</label>
            <input type="datetime-local" id="remind" name="remind_at" value="<?= !empty($edit["remind_at"]) ? date("Y-m-d\TH:i", strtotime($edit["remind_at"])) : "" ?>">
        </div>

        <div class="field">
            <label><input type="checkbox" name="shared" value="1" <?= ($edit ? $edit["shared"] : $page === "shared") ? " checked" : "" ?>> Share with organization</label>
        </div>

        <fieldset class="field">
            <legend>Image (optional)</legend>
            <?php if (!empty($edit["image"])): ?>
                <img src="uploads/<?= e($edit["image"]) ?>" alt="Current image">
                <label><input type="checkbox" name="remove_image" value="1"> Remove current image</label>
            <?php endif ?>
            <label for="image">Upload image (JPG, PNG, WebP, max 2 MB)</label>
            <input type="file" id="image" name="image" accept="image/jpeg,image/png,image/webp">
            <label for="alt">Image description</label>
            <input type="text" id="alt" name="alt" autocomplete="off" value="<?= e($edit["alt"] ?? "") ?>">
        </fieldset>

        <div class="row">
            <button type="submit" class="btn"><?= $edit ? "Save todo" : "Add todo" ?></button>
            <?php if ($edit): ?><a class="btn btn-secondary" href="index.php?page=<?= e($page) ?>">Cancel</a><?php endif ?>
        </div>
    </form>
</section>
