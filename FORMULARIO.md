# Formulário Medicalt — FormSubmit

## Funcionamento

O formulário envia nome, instituição, e-mail de retorno e serviço de interesse por POST HTTPS ao FormSubmit. O destino atual é **ovisu666@gmail.com**. O visitante não precisa abrir um aplicativo de e-mail. A verificação antispam do FormSubmit permanece ativa; um campo oculto `_honey` acrescenta proteção contra preenchimento automatizado.

O JavaScript valida campos com espaços em branco, configura o destino, indica envio em andamento e bloqueia cliques repetidos. Ao retornar com o botão Voltar do navegador, o botão de envio é reativado. Sem JavaScript, o HTML mantém o envio padrão e a validação nativa do navegador.

Após o serviço concluir o envio, `_next` direciona para `obrigado.html`. Com JavaScript, esse endereço é calculado a partir da página atual, funcionando no servidor local e na subpasta do GitHub Pages. Sem JavaScript, o endereço de retorno é o site público configurado no HTML. Não há envio automático ao abrir a página.

## Ativar e testar

1. Inicie o servidor com `npm run dev` e abra o endereço HTTP exibido. Para enviar, não abra o HTML via `file://`.
2. Preencha um contato identificado como teste e clique em **Enviar mensagem**.
3. Conclua a verificação de segurança apresentada pelo FormSubmit, se solicitada.
4. Na caixa **ovisu666@gmail.com**, procure a mensagem de ativação do FormSubmit; confira também o spam. O responsável pelo e-mail precisa clicar no link de confirmação. O primeiro envio serve para solicitar a ativação e não comprova a entrega dos dados.
5. Depois de ativar, faça um novo teste. Confirme a chegada dos quatro campos na caixa de entrada, o assunto e o endereço usado ao responder.
6. Confira o retorno para `obrigado.html` e o link **Voltar ao site**.
7. Repita o teste no endereço público após a publicação. Se o serviço solicitar uma nova ativação para esse formulário, conclua-a.

Uma resposta de sucesso do serviço não garante que a mensagem já chegou à caixa de entrada. O teste só está completo após a confirmação do destinatário. Falhas de rede, verificação e erros do serviço são exibidos pelo navegador ou pelo FormSubmit; use Voltar para retornar ao formulário e tentar novamente. Evite repetir envios quando houver dúvida sobre o recebimento.

## Trocar pelo e-mail institucional

1. Em `assets/config.js`, substitua o valor de `contactEmail` pelo novo endereço completo. Esse arquivo é público: nunca insira senha, chave de API ou credencial.
2. Em `index.html`, altere também o atributo `action` do formulário `contact-form`: `https://formsubmit.co/NOVO_EMAIL`. Essa é a configuração usada sem JavaScript.
3. Altere `contactSubject` em `assets/config.js` se necessário. Mantenha o mesmo assunto no campo oculto `_subject` do HTML.
4. Salve em UTF-8, execute `npm run check` e repita a ativação e o teste de recebimento no novo e-mail.
5. Publique os arquivos alterados juntos. Não basta trocar apenas o texto de uma página.

## Arquivos e publicação

- `index.html`: campos, destino sem JavaScript e aviso sobre o processamento dos dados.
- `assets/config.js`: destino e assunto usados pelo JavaScript.
- `assets/contact.js`: configuração, validação complementar e estado de envio.
- `assets/main.js`: navegação e serviços, independente do formulário.
- `assets/styles.css`: aparência do formulário e da confirmação.
- `obrigado.html`: página de retorno.
- `scripts/check.mjs`: testes locais sem envio de dados.

No pacote `medicalt-unificado`, os arquivos do site ficam dentro de `dist/`. No pacote `medicalt-prototipo`, ficam na raiz para GitHub Pages. Ao trocar o domínio ou nome do repositório, atualize o endereço absoluto de `_next` no HTML. Publique `obrigado.html`, `assets/contact.js`, o HTML e o CSS juntos.

O site não grava os campos em armazenamento local. Os dados são processados por um serviço externo; conforme a documentação do FormSubmit, os envios podem ser retidos por 30 dias. Não use o formulário para informações de pacientes.

Referências: [configuração e antispam](https://formsubmit.co/documentation), [ativação inicial](https://formsubmit.co/).
