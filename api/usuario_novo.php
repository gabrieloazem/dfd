<?php
header("Content-Type: application/json; charset=utf-8");

require_once 'criptografia.php';

require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

// opcional: garantir que o PDO lance exceções
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    // ler JSON (sem validação)
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        throw new Exception('JSON inválido');
    }
    
    $senha_criptografada = null;
    if (isset($input['senha'])) {
        $senha_criptografada = criptografar($input['senha'], $chave);
        if ($senha_criptografada === false) {
            throw new Exception('Erro na criptografia');
        }
    }
    
    $nome_criptografado = null;
    if (isset($input['nome'])) {
        $nome_criptografado = criptografar($input['nome'], $chave);
        if ($nome_criptografado === false) {
            throw new Exception('Erro na criptografia');
        }
    }
    
    $cpf_criptografado = null;
    if (isset($input['cpf'])) {
        $cpf_criptografado = criptografar($input['cpf'], $chave);
        if ($cpf_criptografado === false) {
            throw new Exception('Erro na criptografia');
        }
    }
    
    $email_criptografado = null;
    if (isset($input['endereco_de_email'])) {
        $email_criptografado = criptografar($input['endereco_de_email'], $chave);
        if ($email_criptografado === false) {
            throw new Exception('Erro na criptografia');
        }
    }


    $sql = "
        INSERT INTO usuarios (
            sistema,
            subunidade,
            unidade,
            cpf,
            senha,
            permissao,
            cargo,
            matricula,
            email,
            nome
        ) VALUES (
            :sistema,
            :subunidade,
            :unidade,
            :cpf,
            :senha,
            :permissao,
            :cargo,
            :matricula,
            :email,
            :nome
        )
    ";

    $stmt = $pdo->prepare($sql);

    // mapear os parâmetros diretamente do input (sem validação)
    $params = [
        ':sistema'    => 'DFD',
        ':subunidade' => isset($input['subunidade']) ? $input['subunidade'] : null,
        ':unidade'    => isset($input['unidade']) ? $input['unidade'] : null,
        ':cpf'        => $cpf_criptografado,
        ':senha'      => $senha_criptografada,
        ':permissao'  => 'N',
        ':cargo'      => isset($input['cargo']) ? $input['cargo'] : null,
        ':matricula'  => isset($input['matricula']) ? $input['matricula'] : null,
        ':email'      => $email_criptografado,
        ':nome'       => $nome_criptografado
    ];

    $pdo->beginTransaction();
    $stmt->execute($params);
    $lastId = $pdo->lastInsertId();
    $pdo->commit();

    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $lastId]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
