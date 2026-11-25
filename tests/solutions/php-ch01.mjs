const raw = String.raw;

export const SOLUTIONS_01 = {
  "php-hello-calc": raw`<?php
echo "Привіт, PHP!" . PHP_EOL;
echo "2 + 3 = " . (2 + 3) . PHP_EOL;
`,
  "php-tags-template": raw`<?php
$price = 120;
?>
Ціна: <?= $price ?> грн
<?php
echo "Магазин відкрито\n";
`,
  "php-env-check": raw`<?php
error_reporting(E_ALL);
echo "Режим: " . PHP_SAPI . "\n";
echo "PHP 8.1+: " . (PHP_VERSION_ID >= 80100 ? "так" : "ні") . "\n";
`,
  "php-version-gate": raw`<?php
function compatible(string $version, string $required): bool
{
    return version_compare($version, $required, '>=');
}

foreach (['7.4.33', '8.1.0', '8.10.2'] as $v) {
    echo $v . ' ' . (compatible($v, '8.1.0') ? 'так' : 'ні') . "\n";
}
`,
};
