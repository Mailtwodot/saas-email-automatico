# SaaS Envio Automático de Emails

Este projeto é um MVP de um SaaS que automatiza o envio de emails personalizados utilizando uma base de contatos (Google Sheets ou upload de CSV) e envia emails por meio do Gmail autenticado do usuário.

## Funcionalidades (MVP)
- Login com Google (OAuth2)
- Importação de base de emails via Google Sheets ou CSV
- Criação e preview de templates de email com variáveis
- Envio em massa pela própria conta Gmail do usuário
- Dashboard com relatório de sucesso/falha dos envios

## Como rodar localmente

1. Certifique-se de ter [Node.js](https://nodejs.org/) instalado (versão 18+ recomendada)
2. Clone este repositório
```bash
git clone <repo-url>
cd <pasta-do-projeto>
```
3. Instale as dependências:
```bash
npm install
```
4. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
   - Ative as APIs do Google Sheets e Gmail
   - Pegue suas credenciais OAuth2 (Client ID + Secret)
   - Renomeie `.env.example` para `.env.local` e preencha as variáveis
5. Inicie o servidor local:
```bash
npm run dev
```
6. Acesse em [http://localhost:3000](http://localhost:3000)

---

## Limitações do Gmail
O Gmail limita o número de emails diários enviados via API (~500 para contas grátis, ~2.000 para Workspace). O app mostrará alertas durante o uso.

---

## Tecnologias
- Next.js (Fullstack: Frontend + Backend)
- NextAuth.js (autenticação Google)
- googleapis (integração Gmail & Sheets)
- React (UI)

---

## Licença
MIT
