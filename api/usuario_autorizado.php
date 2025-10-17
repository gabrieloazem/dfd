<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['id'])) {
        throw new Exception("Campo 'id' é obrigatório.");
    }

    // Prepara a query com placeholders
    $sql = "
        UPDATE usuarios SET 
        permissao = 'S'
        WHERE id = :id
    ";
    $stmt = $pdo->prepare($sql);

    $stmt->execute([':id' => $input['id']]);

    echo json_encode([
        "resultado" => 'Usuário Autorizado !'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
