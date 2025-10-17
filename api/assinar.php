<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);

  

    // Prepara a query com placeholders para todos os campos usados
    $sql = "
        UPDATE dfd_item SET
            assinatura_data = :data,
            assinatura_usuario = :usuario,
            assinatura_matricula = :matricula, 
            assinatura_cargo = :cargo,
            assinatura_hora = :hora,
            unidade_email = :email,
            status = 'CAPTURADO'
        WHERE unidade = :unidade
        AND grupo_id = :grupo_id
    ";


    $stmt = $pdo->prepare($sql);


    // Executa passando todos os parâmetros
    $resultado = $stmt->execute([
        ':data' => $input['data'],
        ':usuario' => $input['usuario'],
        ':matricula' => $input['matricula'],
        ':cargo' => $input['cargo'],
        ':hora' => $input['hora'],
        ':email' => $input['email'],
        ':unidade' => $input['unidade'],
        ':grupo_id' => $input['grupo_id']
    ]);

    echo json_encode([
        "resultado" => $resultado
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
