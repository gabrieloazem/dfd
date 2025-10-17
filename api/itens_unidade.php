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
    $paramsCount = [];
    $paramsMain = [];

    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);

    $inicio = isset($input['inicio']) ? (int)$input['inicio'] : 0;
    $unidade = $input['unidade'] ?? '';

    // bind da unidade em ambos
    $paramsCount[':unidade'] = $unidade;
    $paramsMain[':unidade'] = $unidade;

    if (!empty($input['filtros'])){

        $grupo_id = $input['filtros']['grupo_id'] ?? '';
        if ($grupo_id !== '') {
            $filtro_grupo_id = "AND grupo_id = :grupo_id";
            // garanta que seja inteiro (ou adapte se for string)
            $paramsCount[':grupo_id'] = (int)$grupo_id;
            $paramsMain[':grupo_id'] = (int)$grupo_id;
        }

        $codigo_sigma = $input['filtros']['codigo_sigma'] ?? '';
        if ($codigo_sigma !== '') {
            $filtro_codigo_sigma = "AND codigo_sigma LIKE :codigo_sigma";
            $paramsCount[':codigo_sigma'] = "%{$codigo_sigma}%";
            $paramsMain[':codigo_sigma'] = "%{$codigo_sigma}%";
        }

        $item = $input['filtros']['item'] ?? '';
        if ($item !== '') {
            $filtro_item = "AND item LIKE :item";
            $paramsCount[':item'] = "%{$item}%";
            $paramsMain[':item'] = "%{$item}%";
        }
    }

    // Contagem do total (prepared)
    $sqlCount = "
        SELECT COUNT(*) AS total
        FROM dfd_item
        WHERE id > 0
        AND unidade = :unidade
        $filtro_grupo_id
        $filtro_codigo_sigma
        $filtro_item
    ";
    $stmt = $pdo->prepare($sqlCount);
    foreach ($paramsCount as $k => $v) {
        // usa INT para grupo_id quando for inteiro
        if ($k === ':grupo_id') {
            $stmt->bindValue($k, $v, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($k, $v, PDO::PARAM_STR);
        }
    }
    $stmt->execute();
    $total = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Query principal (prepared)
    $sql = "
        SELECT 
            id,
            grupo_id,
            grupo_nome,
            codigo_sigma,
            codigo_br,
            item,
            quantidade,
            usuario,
            informado
        FROM dfd_item
        WHERE id > 0
        AND unidade = :unidade
        $filtro_grupo_id
        $filtro_codigo_sigma
        $filtro_item
        LIMIT 50
        OFFSET :inicio
    ";

    $stmt = $pdo->prepare($sql);

    // bind dos parâmetros comuns
    foreach ($paramsMain as $k => $v) {
        if ($k === ':grupo_id') {
            $stmt->bindValue($k, $v, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($k, $v, PDO::PARAM_STR);
        }
    }

    // bind do offset (inteiro)
    $stmt->bindValue(':inicio', (int)$inicio, PDO::PARAM_INT);

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
