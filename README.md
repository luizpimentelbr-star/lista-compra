# lista-compra
# Lista de Compras

Um aplicativo web simples e responsivo para gerenciar listas de compras em supermercados, desenvolvido com HTML, CSS e JavaScript. O app permite adicionar, editar, excluir e limpar itens, com suporte a quantidades fracionadas (ex.: 0.45 kg), armazenamento local via `localStorage`, temas claro/escuro, exportação/importação de listas em formato JSON, escaneamento de códigos de barras, integração com a API Open Food Facts, e exibição da contagem de itens. É compatível com dispositivos móveis, hospedado no GitHub Pages, e funciona offline.

## Funcionalidades

- **Adicionar Itens**: Registre produtos com nome (via texto, escaneamento, ou Open Food Facts), quantidade (fracionada, ex.: 0.45), unidade (kg, g, l, un), preço por unidade (ex.: R$/kg), supermercado e data. O foco retorna ao campo de produto após adição.
- **Quantidades Fracionadas**: Suporte a quantidades decimais (ex.: 0.45 kg de frutas) com unidades de medida (kg, g, l, un). O total é calculado como preço × quantidade.
- **Escanear Códigos de Barras**: Escaneie códigos (EAN-13, UPC-A, QR Code, Code 128). Online, busca o nome na Open Food Facts; offline, usa o código bruto ou nome salvo. Um alerta exibe o resultado e sugere edição, se necessário.
- **Editar e Excluir**: Edite ou remova itens individuais, com foco retornando ao campo de produto.
- **Limpar Lista**: Exclua todos os itens com confirmação.
- **Soma Total**: Calcula o total (preço × quantidade) para todos os itens.
- **Contagem de Itens**: Exibe o número de itens na lista.
- **Tema Claro/Escuro**: Alterne entre temas, com preferência salva localmente.
- **Exportar/Importar**: Exporte a lista como JSON (ex.: `Lista1.json`) e importe listas salvas.
- **Integração com Open Food Facts**: Busca nomes de produtos com base no código de barras, com cache local para uso offline.
- **Suporte Offline**: Todas as funcionalidades (exceto busca inicial na API) funcionam sem internet, usando cache local.
- **Responsividade**: Interface adaptada para desktops e dispositivos móveis.
- **Armazenamento Local**: Dados e cache de produtos salvos no `localStorage`.

## Tecnologias Utilizadas

- **HTML5**: Estrutura da interface.
- **CSS3**: Estilização com animações (fadeIn, slideIn) e responsividade.
- **JavaScript**: Lógica do app, manipulação do DOM e `localStorage`.
- **Barcode Detection API**: Escaneamento de códigos nativo em navegadores Chromium.
- **ZXing**: Polyfill para escaneamento em navegadores não compatíveis.
- **Open Food Facts API**: Busca de nomes de produtos.
- **Font Awesome**: Ícones para botões e interface.
- **VSCode**: Desenvolvimento e testes com a extensão Live Server.
- **GitHub Pages**: Hospedagem do aplicativo.


Desenvolvido com  por Luiz Pimentel, Auxiliado com todo mérito por GROK. Contato: luizpimentelbr@gmail.com  
mailto: luizpimentelbr@gmail.com.

