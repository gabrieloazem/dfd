<?php
// Define o tipo de retorno como JSON
header("Content-Type: application/json; charset=utf-8");

// Configura o timezone
date_default_timezone_set('America/Sao_Paulo');

// Garante que nenhuma saída "extra" quebre o JSON
ob_clean(); // limpa buffer de saída
error_reporting(0); // oculta avisos e notices
ini_set('display_errors', 0);

// Monta os dados
$dia = date("d");
$mes = date("m");
$ano = date("Y");
$hora = date("H");
$minuto = date("i");
$segundos = date("s");

// Formata a data
$data_formatada = "$dia/$mes/$ano às $hora:$minuto:$segundos";

// Retorna como JSON puro
echo json_encode([
    "data" => $data_formatada
]);
