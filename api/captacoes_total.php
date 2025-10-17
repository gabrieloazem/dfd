<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->query("
        SELECT 
            status,
            COUNT(*) AS quantidade
        FROM cla_dfd_grupo
        WHERE id > 0
    ");
    
    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($dados);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
