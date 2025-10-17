<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    $filtro_grupo_id = '';
    $filtro_codigo_sigma = '';
    $filtro_item = '';
    $params = [];
    
    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);
    
    $inicio = isset($input['inicio']) ? (int)$input['inicio'] : 0;
    $unidade = $input['unidade'] ?? '';

    if (!empty($input['filtros'])) {
        $grupo_id = $input['filtros']['grupo_id'] ?? '';
        if ($grupo_id !== '') {
            $filtro_grupo_id = "AND grupo_id = :grupo_id";
            $params[':grupo_id'] = $grupo_id;
        }

        $codigo_sigma = $input['filtros']['codigo_sigma'] ?? '';
        if ($codigo_sigma !== '') {
            $filtro_codigo_sigma = "AND codigo_sigma LIKE :codigo_sigma";
            $params[':codigo_sigma'] = "%$codigo_sigma%";
        }

        $item = $input['filtros']['item'] ?? '';
        if ($item !== '') {
            $filtro_item = "AND item LIKE :item";
            $params[':item'] = "%$item%";
        }
    }

    // Query de contagem (segura)
    $sqlCount = "
        SELECT COUNT(DISTINCT id_item) AS total
        FROM dfd_item
        WHERE id > 0
        $filtro_grupo_id
        $filtro_codigo_sigma
        $filtro_item
    ";
    $stmtCount = $pdo->prepare($sqlCount);
    foreach ($params as $key => $val) {
        $stmtCount->bindValue($key, $val);
    }
    $stmtCount->execute();
    $total = (int)$stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

    // Query principal (segura)
    $sql = "
        SELECT 
            id,
            grupo_id,
            grupo_nome,
            codigo_sigma,
            codigo_br,
            item,
            usuario,
            informado,
            SUM(quantidade) AS quantidade
        FROM dfd_item
        WHERE id > 0
        $filtro_grupo_id
        $filtro_codigo_sigma
        $filtro_item
        GROUP BY id_item
        LIMIT 50
        OFFSET :inicio
    ";
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':inicio', $inicio, PDO::PARAM_INT);
    $stmt->execute();

    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "total" => $total,
        "dados" => $dados
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
