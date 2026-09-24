# Medicalt — protótipo

Site institucional estático, preparado para GitHub Pages. HTML, CSS e JavaScript sem dependências de execução.

## GitHub Pages

Em Settings → Pages, selecione Deploy from a branch, branch main e pasta /(root). Salve e aguarde a publicação.

## Executar localmente

Abra index.html ou execute `npm run dev` com Node.js. Para verificar: `npm run check`.

## Alterações

- Textos, serviços e equipe: index.html.
- Cores, fontes e responsividade: assets/styles.css.
- Destinatário e assunto do formulário: assets/config.js.
- Menu e serviços: assets/main.js.
- Envio do formulário: assets/contact.js.
- Página de confirmação: obrigado.html.
- Abertura, fechamento e foco do modal da equipe: assets/team.js.

O formulário envia nome, instituição, e-mail e interesse pelo FormSubmit, com verificação antispam e retorno à página de confirmação. O destino atual é **ovisu666@gmail.com**. Antes de publicar, ative o endereço e confirme um teste de recebimento. Consulte [Formulário: ativação, testes e troca do e-mail](FORMULARIO.md). Salve os arquivos em UTF-8.

Os serviços 4 a 6 ficam em Ver mais serviços no desktop (acima de 1024 px); em telas menores todos ficam visíveis. O botão Conheça nossa equipe abre um modal com os 11 profissionais informados. Para editar ou adicionar perfis, procure `team-dialog` no index.html e altere os elementos `article.team-card`: iniciais, nome, especialidade e registro. Preserve os IDs do modal e dos botões. Quando a especialidade não estiver disponível, mantenha “Especialidade não informada”. A foto de abertura é ilustrativa e foi fornecida com o projeto. Fontes Manrope e DM Sans carregadas pelo Google Fonts, com fallback Arial.

Esta publicação não concede licença de uso da marca ou das imagens a terceiros.
