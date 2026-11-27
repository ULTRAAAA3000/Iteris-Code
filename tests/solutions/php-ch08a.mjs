const raw = String.raw;

export const SOLUTIONS_08a = {
  "php-strings-slug": raw`<?php
function slugify(string $title): string
{
    return preg_replace('/\s+/', '-', strtolower(trim($title)));
}

function shout(string $s): string
{
    return strtoupper($s) . "!";
}

function isPalindrome(string $s): bool
{
    $s = strtolower($s);
    return $s === strrev($s);
}

echo slugify("  Hello   World From PHP "), "\n";
echo shout("php"), "\n";
echo var_export(isPalindrome("Level"), true), "\n";
echo var_export(isPalindrome("PHP8"), true), "\n";
`,
  "php-mb-preview": raw`<?php
declare(strict_types=1);

function preview(string $text, int $limit): string
{
    if (mb_strlen($text) <= $limit) {
        return $text;
    }
    return mb_substr($text, 0, $limit - 1) . "…";
}

function capitalize(string $s): string
{
    return mb_strtoupper(mb_substr($s, 0, 1)) . mb_substr($s, 1);
}

echo preview("Київ у листопаді: що зміниться", 12), "\n";
echo preview("Львів", 12), "\n";
echo capitalize("україна"), "\n";
`,
  "php-json-roundtrip": raw`<?php
$json = '{"name":"Оксана","age":29,"roles":["editor"]}';

$data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
$data["roles"][] = "admin";
$data["age"]++;

echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), "\n";

try {
    json_decode('{"a": }', true, 512, JSON_THROW_ON_ERROR);
    echo "ok\n";
} catch (JsonException $e) {
    echo "error\n";
}
`,
  "php-regex-logline": raw`<?php
function parseLine(string $line): ?array
{
    $re = '/^(?<date>\d{4}-\d{2}-\d{2}) (?<level>[A-Z]+) (?<msg>.+)$/';
    if (preg_match($re, $line, $m) !== 1) {
        return null;
    }
    return ["date" => $m["date"], "level" => $m["level"], "msg" => $m["msg"]];
}

$lines = [
    "2025-01-15 ERROR Disk is full",
    "broken line without format",
    "2025-01-16 INFO Backup done",
];

foreach ($lines as $line) {
    $r = parseLine($line);
    echo $r === null ? "skip" : $r["level"] . ": " . $r["msg"], "\n";
}
`,
  "php-regex-mask": raw`<?php
function maskCard(string $s): string
{
    return preg_replace_callback('/\b(?:\d{4}\s?){3}(\d{4})\b/', fn(array $m): string => "**** " . $m[1], $s);
}

function squash(string $s): string
{
    return preg_replace('/\s+/u', ' ', trim($s));
}

echo maskCard("Картка 4111 1111 1111 1234 оплачена"), "\n";
echo squash("  багато   зайвих    пропусків "), "\n";
`,
  "php-date-deadline": raw`<?php
function deadline(DateTimeImmutable $start, int $days): DateTimeImmutable
{
    return $start->add(new DateInterval("P{$days}D"));
}

function daysLeft(DateTimeImmutable $now, DateTimeImmutable $end): int
{
    return $now->diff($end)->days;
}

$utc = new DateTimeZone('UTC');
$start = new DateTimeImmutable('2025-01-15 10:00:00', $utc);
$now = new DateTimeImmutable('2025-02-01 09:00:00', $utc);

$end = deadline($start, 30);
echo $end->format('d.m.Y'), "\n";
echo daysLeft($now, $end), "\n";
echo $start->format('Y-m-d'), "\n";
`,
};
