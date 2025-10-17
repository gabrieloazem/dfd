<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    $input = json_decode(file_get_contents("php://input"), true);

    $sql = "
        SELECT * 
        FROM dfd_item 
        WHERE unidade = :unidade
        AND grupo_id = :grupo_id
        GROUP BY unidade
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':grupo_id' => $input['grupo_id'],
        ':unidade' => $input['unidade']
    ]);

    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);


    echo json_encode($dados);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
