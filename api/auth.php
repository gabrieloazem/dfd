<?php
header("Content-Type: application/json; charset=utf-8");
require_once 'database.php';
require_once 'criptografia.php'; // <--- carregando $chave

$resultado_final = '';

$database = new Database();
$pdo = $database->getConnection();

$input = json_decode(file_get_contents('php://input'), true);

// Criptografa os valores que virão na consulta
$cpf_criptografado = criptografar($input['login'], $chave);
$senha_criptografada = criptografar($input['senha'], $chave);

$sql = "
    SELECT 
        id,
        nome, 
        email,
        cargo,
        matricula,
        unidade
    FROM usuarios 
    WHERE cpf = :cpf
    AND senha = :senha
    AND sistema = 'DFD' 
    AND permissao = 'S'
";

$stmt = $pdo->prepare($sql);

$stmt->bindParam(':cpf', $cpf_criptografado);
$stmt->bindParam(':senha', $senha_criptografada);

$stmt->execute();

$resultado = $stmt->fetch(PDO::FETCH_ASSOC);

if($resultado){
    $resultado['nome'] = descriptografar($resultado['nome'], $chave);
    $resultado['email'] = descriptografar($resultado['email'], $chave);
}

echo json_encode([
    "dados" => $resultado
]);
?>
