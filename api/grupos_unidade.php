<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    $filtro_grupo_id = '';
    
    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);
    
    $inicio = $input['inicio'] ?? 0;
    $grupo_id = $input['filtros']['grupo_id'] ?? '';
    $unidade = $input['unidade'] ?? '';


    // Se filtro de grupo_id for informado, adiciona o filtro
    if ($grupo_id != '') {
        $filtro_grupo_id = "AND grupo_id = :grupo_id";   
    }
    
    // Contagem do total de registros
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS total
        FROM dfd_item
        WHERE id > 0
        $filtro_grupo_id
        AND unidade = :unidade
    ");
    
    // Se filtro de grupo_id foi adicionado, bind o parâmetro
    if ($filtro_grupo_id != '') {
        $stmt->bindParam(':grupo_id', $grupo_id, PDO::PARAM_INT);
    }

    // Bind do parâmetro para unidade
    $stmt->bindParam(':unidade', $unidade, PDO::PARAM_STR); 

    $stmt->execute();
    $total = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Query principal com filtros
    $sql = "
        SELECT 
            grupo_id,
            setor_responsavel,
            grupo_nome,
            itens,
            processo,
            status,
            demanda_inicio,
            demanda_fim
        FROM dfd_item
        WHERE id > 0
        $filtro_grupo_id
        AND unidade = :unidade  
        GROUP BY grupo_id
        ORDER BY grupo_id ASC
        LIMIT 50
        OFFSET :inicio
    ";

    $stmt = $pdo->prepare($sql);

    // Bind dos parâmetros
    $stmt->bindParam(':inicio', $inicio, PDO::PARAM_INT);
    if ($filtro_grupo_id != '') {
        $stmt->bindParam(':grupo_id', $grupo_id, PDO::PARAM_INT);
    }

    // Bind para unidade
    $stmt->bindParam(':unidade', $unidade, PDO::PARAM_STR);

    $stmt->execute();
    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "teste" => $input,
        "total" => $total,
        "dados" => $dados
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
