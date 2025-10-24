# SaaS Envio Automático de Emails

Um SaaS completo que permite enviar e-mails personalizados em massa usando Google Sheets como base de dados e Gmail para envio.

## ✨ Funcionalidades

- 🔐 **Autenticação Google** - Login seguro com OAuth2
- 📊 **Integração Google Sheets** - Importa contatos automaticamente
- ✉️ **Envio personalizado** - Usa variáveis como [Nome] nas mensagens
- 📧 **Gmail integrado** - Envia pela conta autenticada do usuário
- 🎯 **Mail merge** - Um e-mail único para cada destinatário

## 🚀 Como usar

1. Faça login com sua conta Google
2. Cole o ID/link da sua planilha do Google Sheets
3. Escreva o assunto e mensagem (use [Nome] para personalizar)
4. Clique em enviar!

## 🛠️ Tecnologias

- **Next.js 16** - Framework React fullstack
- **NextAuth.js** - Autenticação OAuth2
- **Google APIs** - Gmail + Sheets integration
- **Tailwind CSS** - Styling moderno

## 📋 Pré-requisitos

- Node.js 18+
- Conta Google Cloud Console configurada
- Planilha Google Sheets com colunas Nome e Email

## 🔧 Configuração

1. Clone o repositório
2. Instale dependências: `npm install`
3. Configure `.env.local` com suas credenciais Google
4. Execute: `npm run dev`

## 📝 Estrutura da planilha

| Nome | Email |
|------|-------|
| João | joao@email.com |
| Maria | maria@email.com |

## 🎯 Próximas funcionalidades

- Dashboard com estatísticas
- Templates de e-mail
- Agendamento de envios
- Relatórios de entrega