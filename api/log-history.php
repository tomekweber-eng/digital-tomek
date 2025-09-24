<?php
// log-history.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(["error" => "Only POST allowed"]);
  exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['question']) || !isset($data['answer']) || !isset($data['timestamp'])) {
  http_response_code(400);
  echo json_encode(["error" => "Invalid payload"]);
  exit;
}

$date = date('Y-m-d');
$logDir = __DIR__ . '/../conversations';
$logFile = $logDir . '/' . $date . '.json';

if (!file_exists($logDir)) {
  mkdir($logDir, 0775, true);
}

$existing = file_exists($logFile) ? json_decode(file_get_contents($logFile), true) : [];
$existing[] = $data;

file_put_contents($logFile, json_encode($existing, JSON_PRETTY_PRINT));
echo json_encode(["status" => "saved"]);
?>