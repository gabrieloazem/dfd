<?php
header("Content-Type: application/json; charset=utf-8");
require_once 'database.php';
require_once 'criptografia.php'; // <--- carregando $chave

$resultado_final = '';

$database = new Database();
$pdo = $database->getConnection();

$input = json_decode(file_get_contents('php://input'), true);

// Criptografa os valores que vir達o na consulta
$senha_criptografada = criptografar($input['senha'], $chave);

$sql = "
    SELECT id
    FROM usuarios 
    WHERE id = :id
    AND senha = :senha
    AND sistema = 'DFD' 
    AND permissao = 'S'
";

$stmt = $pdo->prepare($sql);

$stmt->bindParam(':id', $input['id']);
$stmt->bindParam(':senha', $senha_criptografada);

$stmt->execute();

$resultado = $stmt->fetch(PDO::FETCH_ASSOC);

if($resultado){
    echo json_encode(true);
}
else{
    echo json_encode(false);
}


?>
