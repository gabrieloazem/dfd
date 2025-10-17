<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);

    // Validação simples
    if (!isset($input['demanda_inicio'], $input['demanda_fim'], $input['grupos'], $input['unidades'])) {
        throw new Exception("Parâmetros insuficientes.");
    }

    $demanda_inicio = $input['demanda_inicio'];
    $demanda_fim = $input['demanda_fim'];
    $grupos = $input['grupos'];      // array de IDs
    $unidades = $input['unidades'];  // array de strings

    if (!is_array($grupos) || !is_array($unidades)) {
        throw new Exception("Parâmetros grupos e unidades devem ser arrays.");
    }

    // Montar placeholders dinâmicos para IN()
    $placeholders_grupos = implode(',', array_fill(0, count($grupos), '?'));
    $placeholders_unidades = implode(',', array_fill(0, count($unidades), '?'));

    // Montar query
    $sql = "
        UPDATE dfd_item SET 
            status = 'EM CAPTAÇÃO', 
            demanda_inicio = ?, 
            demanda_fim = ?
        WHERE grupo_id IN ($placeholders_grupos)
        AND unidade IN ($placeholders_unidades)
    ";

    $stmt = $pdo->prepare($sql);

    // Montar array de parâmetros para bind, na ordem dos placeholders
    // Primeiro demanda_inicio e demanda_fim, depois grupos e unidades
    $params = array_merge([$demanda_inicio, $demanda_fim], $grupos, $unidades);

    // Executar
    $stmt->execute($params);

    echo json_encode([
        "resultado" => 'Demanda Solicitada!'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
