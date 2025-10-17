<?php
header("Content-Type: application/json; charset=utf-8");

// Database
require_once 'database.php';
$database = new Database();
$pdo = $database->getConnection();

try {
    // Captura os dados da requisição
    $input = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->query("
        SELECT 
            id,
            pca,
            processo,
            codigo_sigma,
            item,
            grupo_id,
            grupo_nome,
            SUM(quantidade) as quantidade_total,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 1.0' THEN quantidade END), 0) AS CDSAP1,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 2.1' THEN quantidade END), 0) AS CDSAP21,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 2.2' THEN quantidade END), 0) AS CDSAP22,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 3.1' THEN quantidade END), 0) AS CDSAP31,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 3.2' THEN quantidade END), 0) AS CDSAP32,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 3.3' THEN quantidade END), 0) AS CDSAP33,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 4.0' THEN quantidade END), 0) AS CDSAP14,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 5.1' THEN quantidade END), 0) AS CDSAP51,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 5.2' THEN quantidade END), 0) AS CDSAP52,
              COALESCE(MAX(CASE WHEN unidade = 'Coordenadoria de Saúde da AP 5.3' THEN quantidade END), 0) AS CDSAP53,
              
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Souza Aguiar' THEN quantidade END), 0) AS HMSA,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Fernando Magalhães' THEN quantidade END), 0) AS HMF,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Miguel Couto' THEN quantidade END), 0) AS HMMC,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Jesus' THEN quantidade END), 0) AS HMJ,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal do Paulino Weneck' THEN quantidade END), 0) AS HMPW,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Salgado Filho' THEN quantidade END), 0) AS HMSF,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Maternidade Carmela Dutra' THEN quantidade END), 0) AS HMCD,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal da Piedade' THEN quantidade END), 0) AS HMP,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal da Assistência a Saúde Nise da Silveira' THEN quantidade END), 0) AS HMNS,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Maternidade Herculano Pinheiro' THEN quantidade END), 0) AS HMHP,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Ronaldo Gazzola' THEN quantidade END), 0) AS HMRG,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Francisco da Silva Telles' THEN quantidade END), 0) AS HMFST,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Alexander Fleming' THEN quantidade END), 0) AS HMAF,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Lourenço Jorge' THEN quantidade END), 0) AS HMLJ,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal de Assistência a Saúde Juliano Moreira' THEN quantidade END), 0) AS HMJM,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Raphael de Paula Souza' THEN quantidade END), 0) AS HMRPS,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Nossa Senhora do Loreto' THEN quantidade END), 0) AS HMNSL,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Barata Ribeiro' THEN quantidade END), 0) AS HMBR,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Philippe Pinel' THEN quantidade END), 0) AS HMPP,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Rocha Maia' THEN quantidade END), 0) AS HMRM,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Alvaro Ramos' THEN quantidade END), 0) AS HMAR,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital de Geriatria e Gerontologia Miguel Pedro' THEN quantidade END), 0) AS HGGMP,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital da Mulher Mariska Ribeiro' THEN quantidade END), 0) AS HMMR,
              COALESCE(MAX(CASE WHEN unidade = 'Novo Complexo Hospitalar Municipal Pedro II' THEN quantidade END), 0) AS NHMP2,
              COALESCE(MAX(CASE WHEN unidade = 'Hospital Municipal Rocha Faria' THEN quantidade END), 0) AS HMRF

        FROM dfd_item
        GROUP BY grupo_id, codigo_sigma;
        ORDER BY 
            grupo_id ASC
    ");
    
    $dados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($dados);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["erro" => $e->getMessage()]);
}
?>
