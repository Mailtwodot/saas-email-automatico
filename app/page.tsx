"use client";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!spreadsheetId.trim()) {
      setStatus("Por favor, informe o ID ou link da planilha do Google Sheets.");
      return;
    }
    
    if (!subject.trim()) {
      setStatus("Assunto obrigatório.");
      return;
    }
    if (!body.trim()) {
      setStatus("Mensagem obrigatória.");
      return;
    }

    try {
      const resp = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId,
          subject,
          body,
        }),
      });
      const data = await resp.json();
      if (data.ok) {
        setStatus(`Backend respondeu: ${data.message}`);
        setSpreadsheetId("");
        setSubject("");
        setBody("");
      } else {
        setStatus("Erro ao enviar no servidor.");
      }
    } catch (err) {
      setStatus("Erro de rede ao chamar o backend.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-24 px-8 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold mb-8 text-black dark:text-zinc-50">SaaS Envio Automático de Emails</h1>
        {!session && (
          <>
            <p className="mb-6 text-zinc-700 dark:text-zinc-200">Você precisa estar autenticado para enviar e-mails.</p>
            <button
              onClick={() => signIn("google")}
              className="bg-red-600 text-white mt-2 px-6 py-2 rounded font-medium hover:bg-red-700 transition-colors"
            >
              Entrar com Google
            </button>
          </>
        )}
        {session && (
          <>
            <div className="flex items-center gap-3 mb-4 w-full justify-between">
              <span className="text-green-700 dark:text-green-300 font-medium">Logado como {session.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-zinc-300 text-zinc-800 px-4 py-1 rounded hover:bg-zinc-400 transition-colors"
              >
                Sair
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4 bg-zinc-100 p-8 rounded shadow w-full max-w-md"
            >
              <label htmlFor="spreadsheetId" className="text-lg font-medium text-zinc-700">ID da Planilha Google Sheets</label>
              <input
                id="spreadsheetId"
                type="text"
                value={spreadsheetId}
                onChange={e => setSpreadsheetId(e.target.value)}
                className="border border-zinc-300 rounded p-2 w-full"
                placeholder="Cole aqui o ID ou link da planilha (ex: 1u5ayHGUskKwQvkfyqTgtfqPlTJRG3IbkjT5vMePDmuQ)"
                required
              />
              <label htmlFor="subject" className="text-lg font-medium text-zinc-700">Assunto</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="border border-zinc-300 rounded p-2 w-full"
                placeholder="Assunto do e-mail (use [Nome] para personalizar)"
                required
              />
              <label htmlFor="body" className="text-lg font-medium text-zinc-700">Mensagem</label>
              <textarea
                id="body"
                value={body}
                onChange={e => setBody(e.target.value)}
                className="border border-zinc-300 rounded p-2 w-full min-h-[120px]"
                placeholder="Digite a mensagem (use [Nome] para personalizar cada destinatário)"
                required
              />
              <button
                type="submit"
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-6 py-2 transition-colors"
              >
                Enviar e-mails personalizados
              </button>
              {status && (
                <div className="mt-2 text-green-600 font-medium">{status}</div>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  );
}