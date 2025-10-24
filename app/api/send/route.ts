import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";

// Função auxiliar para criar o corpo bruto do e-mail (formato RFC822)
function makeEmailBody({ to, subject, body, from }: { to: string, subject: string, body: string, from: string }) {
  const str = [
    `From: <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\n");
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// Função para extrair ID da planilha do link
function extractSpreadsheetId(urlOrId: string): string {
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : urlOrId;
}

export async function POST(request: NextRequest) {
  // Pega sessão do usuário logado!
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Acesso negado: faça login." }, { status: 401 });
  }

  // Pega token de acesso do Google OAuth
  const token = session?.user?.accessToken || (session as any).accessToken;
  const userEmail = session.user?.email;

  if (!token || !userEmail) {
    return NextResponse.json({ error: "Não foi possível pegar token do Google." }, { status: 401 });
  }

  const { spreadsheetId, subject, body } = await request.json();

  if (!spreadsheetId) {
    return NextResponse.json({ error: "ID da planilha é obrigatório." }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Extrai o ID da planilha
    const actualSpreadsheetId = extractSpreadsheetId(spreadsheetId);

    // Lê os dados da planilha (assumindo que a primeira linha são os cabeçalhos)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: actualSpreadsheetId,
      range: "A:B", // Colunas A e B (Nome e Email)
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json({ error: "Planilha vazia ou sem dados suficientes." }, { status: 400 });
    }

    // Remove a primeira linha (cabeçalhos) e processa os dados
    const contacts = rows.slice(1).map(row => ({
      nome: row[0] || "",
      email: row[1] || ""
    })).filter(contact => contact.nome && contact.email);

    if (contacts.length === 0) {
      return NextResponse.json({ error: "Nenhum contato válido encontrado na planilha." }, { status: 400 });
    }

    // Envia e-mails personalizados para cada contato
    let successCount = 0;
    for (const contact of contacts) {
      try {
        // Personaliza assunto e corpo com o nome do contato
        const personalizedSubject = subject.replace(/\[Nome\]/g, contact.nome);
        const personalizedBody = body.replace(/\[Nome\]/g, contact.nome);

        const rawBody = makeEmailBody({
          to: contact.email,
          subject: personalizedSubject,
          body: personalizedBody,
          from: userEmail,
        });

        await gmail.users.messages.send({
          userId: "me",
          requestBody: { raw: rawBody },
        });

        successCount++;
      } catch (emailError) {
        console.error(`Erro ao enviar para ${contact.email}:`, emailError);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: `E-mails enviados com sucesso! ${successCount} de ${contacts.length} contatos processados.` 
    });

  } catch (err) {
    console.error("Erro ao processar planilha ou enviar emails:", err);
    return NextResponse.json({ error: "Erro ao processar planilha ou enviar emails.", raw: String(err) }, { status: 500 });
  }
}