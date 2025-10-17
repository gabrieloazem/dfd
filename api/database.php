<?php

class Database {
    private $host = 'ns224.hostgator.com.br';
    private $db_name = 'jeyore93_banco_de_dados';
    private $username = 'jeyore93_prefeitura';
    private $password = 'h5qhT9s#**^S';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo "Erro ao conectar com o banco de dados: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>