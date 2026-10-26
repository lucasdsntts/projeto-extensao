📦 Sistema de Gestão de Cestas Básicas — Projeto Extensionista

Aplicação web desenvolvida para a modernização e automação do controlo de cadastros, gestão de estoque e registo de entregas de cestas básicas para famílias vulneráveis assistidas por instituição social/religiosa sem fins lucrativos.

📌 Temática do Projeto

Temática 1: Digitalização e Automação de Processos Sociais.

Objetivo: Substituir processos manuais em papel/cadernos por uma plataforma web centralizada, ágil e acessível via navegador em qualquer dispositivo.

🚀 Funcionalidades Principais

Gestão de Estoque: Controlo quantitativo em tempo real com baixa automática ao registar entregas e capacidade de atualização direta.

Cadastro e Edição de Famílias: Registo completo dos responsáveis com nome, CPF, telefone e endereço, com funcionalidade de atualização e exclusão de cadastros.

Busca e Pesquisa Instantânea: Filtro em tempo real por nome ou CPF no painel de famílias.

Lembretes Inteligentes & Badges de Status:

Alerta no topo do painel indicando famílias que não recebem cestas há mais de 30 dias.

Badges visuais coloridas ao lado do nome dos beneficiários (Nunca recebeu, Em dia, Apto (30+ dias)).

Registo de Entregas: Associação rápida entre família e entrega com campo para observações e validação automática de estoque.

Relatórios e Exportação:

Exportação de dados completos em CSV / Excel.

Geração de PDF corporativo formatado para impressão.

🛠️ Tecnologias Utilizadas

Front-end: HTML5, JavaScript (ES6+ Modules), Tailwind CSS (estilização utilitária via CDN).

Back-end & Banco de Dados: Supabase (PostgreSQL & REST APIs).

Pop-ups & Notificações: SweetAlert2.

Hospedagem & Deploy: Netlify / GitHub Pages.

🛡️ Segurança e Proteção de Dados (LGPD)

Em conformidade com as diretrizes de proteção de dados pessoais e requisitos de integridade acadêmica:

O banco de dados opera com políticas de segurança restritas via chave pública de leitura/gravação.

Todos os dados expostos em relatórios, prints e apresentações acadêmicas foram devidamente anonimizados.

📁 Estrutura do Repositório

.
├── index.html       # Painel Principal (Dashboard & Lembretes)
├── estoque.html     # Gestão de Estoque
├── familias.html    # Cadastro, Edição e Listagem de Famílias
├── entregas.html    # Registo e Histórico de Entregas
├── app.js           # Lógica da Aplicação & Integração Supabase
└── README.md        # Documentação do Projeto


💻 Como Executar o Projeto Localmente

Clone o repositório:

git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git


Abra a pasta do projeto no seu navegador abrindo diretamente o ficheiro index.html ou utilizando uma extensão de servidor local (como Live Server no VS Code).