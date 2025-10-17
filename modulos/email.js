function email(remetente,destinatario, assunto, mensagem, tags){
 console.log(remetente, destinatario, assunto, mensagem, tags)
 $.ajax ({
  url: '../00 Scripts/email.php', 
  type: 'POST',
  async: false,
  data: { 
   remetente: remetente,
   destinatario: destinatario,
   assunto: assunto,
   mensagem: mensagem,
   tags: tags
  },
  success: function ( resultado ) {
   console.log(resultado)
   console.log('Email enviado !')
  }

 })
}

function dataDatabase ( data ) {
 var ano = data.slice ( 6,10 )
 var mes = data.slice ( 3,5 )
 var dia = data.slice ( 0,2 )
 data = `${ano}-${mes}-${dia}`
 return data 
}

function avisarEvento(){
 dataAtual = dataDatabase(data_hora_atual().slice(0,10))
 var dia = parseInt(dataAtual.slice(8,10))
 var mes = `${dataAtual.slice(0,8)}01`
 var eventos = sqll(`SELECT id, nome, dia, email FROM evento WHERE mes = '${mes}'`)
 
 for(c1 = 0; c1 < eventos.length; c1 ++){
  var id = eventos[c1].get('id')
  var nome = eventos[c1].get('nome')
  var diaa = parseInt(eventos[c1].get('dia'))
  var mail = eventos[c1].get('email')
  if(dia == diaa){
   if(mail == 'n'){
    email('gabrieloazemvieira@gmail.com','Lembrete',nome,'.')
    var resultado = sqll(`UPDATE evento SET email = 's' WHERE id = '${id}'`)
   }
  }
 }
 
}
