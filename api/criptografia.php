<?php

$chave = require 'key.php'; 

function criptografar($texto, $chave){
    $cifra = "aes-128-ecb";
    return openssl_encrypt($texto, $cifra, $chave, 0);
}

function descriptografar($texto_criptografado, $chave) {
    $cifra = "aes-128-ecb"; 
    return openssl_decrypt($texto_criptografado, $cifra, $chave, 0);
}

?>