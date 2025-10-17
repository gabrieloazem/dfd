<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);

    // Verifica se é um array de objetos
    if (!is_array($input)) {
        throw new Exception("Entrada inválida. Esperado um array de objetos JSON.");
    }

    // Prepara a query com placeholders
    $sql = "UPDATE dfd_item SET informado = :informado, usuario = :usuario, quantidade = :quantidade WHERE id = :id";
    $stmt = $pdo->prepare($sql);

    $resultados = [];
    
    foreach ($input as $item) {
        // Sanitiza e valida os campos (opcional, mas recomendado)
        $id = isset($item['id']) ? (int)$item['id'] : 0;
        $informado = isset($item['informado']) ? $item['informado'] : '';
        $usuario = isset($item['usuario']) ? $item['usuario'] : '';
        $quantidade = isset($item['quantidade']) ? $item['quantidade'] : '0';

        // Pula se id inválido
        if ($id <= 0) continue;

        // Bind e execute com dados seguros
        $stmt->bindValue(':informado', $informado, PDO::PARAM_STR);
        $stmt->bindValue(':usuario', $usuario, PDO::PARAM_STR);
        $stmt->bindValue(':quantidade', $quantidade, PDO::PARAM_STR); // ajuste se for numérico
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        $success = $stmt->execute();

        // Armazena resultado de cada execução
        $resultados[] = [
            'id' => $id,
            'sucesso' => $success
        ];
    }

    echo json_encode([
        "resultado" => 'Quantidades Atualizadas !'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
