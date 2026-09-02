# ATHLEX

## Sport Intelligence Platform

A ATHLEX é uma plataforma de inteligência esportiva voltada ao acompanhamento de atletas, planejamento de treinamentos, gestão de equipes e análise de desempenho.

A plataforma será composta por um único sistema com experiências e permissões diferentes para três perfis:

- Atleta;
- Técnico;
- Gestor.

O perfil acessado será definido de acordo com a conta, os vínculos do usuário e suas permissões.

## Modelos de utilização

A plataforma poderá funcionar em três estruturas principais:

### Estrutura institucional

Gestor → Técnico → Atleta

Indicada para clubes, escolas, universidades, projetos esportivos e organizações.

### Estrutura de treinador independente

Técnico → Atleta

Indicada para treinadores, assessorias esportivas e equipes independentes.

### Estrutura individual

Atleta

Indicada para corredores, ciclistas, praticantes de exercícios e atletas sem vínculo com uma equipe cadastrada.

## Princípio de acesso

Cada perfil possui responsabilidades diferentes:

- o atleta registra informações pessoais e responde aos instrumentos de acompanhamento;
- o técnico planeja, acompanha e avalia o trabalho esportivo;
- o gestor administra a instituição, as equipes, os usuários e as permissões.

## Tecnologias atuais

### Front-end

- HTML;
- CSS;
- JavaScript;
- VS Code.

### Planejamento futuro

- React;
- React Native com Expo;
- API;
- banco de dados;
- autenticação;
- armazenamento de arquivos.

## Estrutura do projeto

```text
ATHLEX/
├── index.html
├── explorar.html
│
├── paginas/
│   ├── autenticacao/
│   ├── cadastros/
│   ├── boas-vindas/
│   ├── atleta/
│   ├── treinador/
│   └── gestor/
│
├── estilos/
│   ├── base/
│   ├── componentes/
│   └── paginas/
│
├── scripts/
│   ├── componentes/
│   ├── paginas/
│   ├── servicos/
│   └── utilitarios/
│
├── recursos/
│   ├── imagens/
│   ├── logos/
│   ├── icones/
│   └── fontes/
│
└── documentacao/
