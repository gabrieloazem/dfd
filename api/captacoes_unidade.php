<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    // Captura os dados da requisição JSON
    $input = json_decode(file_get_contents("php://input"), true);

    $unidade = $input['unidade'] ?? null;

    if ($unidade === null) {
        throw new Exception("Parâmetro 'unidade' é obrigatório.");
    }

    $sql = "
        SELECT 
            status,
            COUNT(DISTINCT grupo_id) AS quantidade
        FROM dfd_item
        WHERE id > 0
        AND unidade = :unidade
        GROUP BY status
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':unidade' => $unidade]);

    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($dados);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
