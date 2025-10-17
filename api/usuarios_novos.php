<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'criptografia.php'; // corrigido o nome do arquivo
require_once 'database.php';

$chave = require 'key.php'; // precisa carregar a chave

$database = new Database();
$pdo = $database->getConnection();

try {
    $input = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->query("
        SELECT 
            id,
            nome,
            cpf,
            email
        FROM usuarios 
        WHERE permissao = 'N' 
        AND sistema = 'DFD'
    ");
    
    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if($dados){
        foreach($dados as &$usuario){
            $usuario['nome'] = descriptografar($usuario['nome'], $chave);
            $usuario['email'] = descriptografar($usuario['email'], $chave);
        }
        unset($usuario);
    }

    echo json_encode($dados);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
