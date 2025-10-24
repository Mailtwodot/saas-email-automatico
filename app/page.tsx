"use client";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Loader2, Mail, FileSpreadsheet, Send, CheckCircle2, AlertCircle, Eye, Sparkles, LogOut, User, Play } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({ spreadsheetId: '', subject: '', body: '' });

  const validateField = (field: string, value: string) => {
    switch(field) {
      case 'spreadsheetId':
        return value.trim() ? '' : 'ID ou link da planilha é obrigatório';
      case 'subject':
        return value.trim() ? '' : 'Assunto é obrigatório';
      case 'body':
        return value.trim() ? '' : 'Mensagem é obrigatória';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    
    switch(field) {
      case 'spreadsheetId':
        setSpreadsheetId(value);
        break;
      case 'subject':
        setSubject(value);
        break;
      case 'body':
        setBody(value);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      spreadsheetId: validateField('spreadsheetId', spreadsheetId),
      subject: validateField('subject', subject),
      body: validateField('body', body),
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      setStatus({ type: 'error', message: 'Por favor, preencha todos os campos corretamente.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Enviando e-mails...' });

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
        setStatus({ type: 'success', message: data.message });
        setSpreadsheetId("");
        setSubject("");
        setBody("");
        setErrors({ spreadsheetId: '', subject: '', body: '' });
      } else {
        setStatus({ type: 'error', message: data.error || "Erro ao enviar no servidor." });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Erro de rede ao chamar o backend." });
    }
  };

  const previewMessage = {
    subject: subject.replace(/\[Nome\]/g, 'João Silva'),
    body: body.replace(/\[Nome\]/g, 'João Silva')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200/40 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">EmailFlow</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Envio automático de e-mails</p>
              </div>
            </div>
            
            {session && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{session.user?.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-300 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!session ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bem-vindo ao EmailFlow</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Envie e-mails personalizados em massa com integração ao Google Sheets
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-sm">
                <button
                  onClick={() => signIn("google")}
                  className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5" />
                    Entrar com Google
                  </span>
                </button>
                <button
                  onClick={() => signIn("google")}
                  className="px-8 py-3 rounded-xl border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Ver Demo
                  </span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200 dark:border-gray-700 w-full max-w-md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">1000+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Usuários</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">50k+</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">E-mails Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">99.9%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Entregabilidade</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nova Campanha</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure sua mensagem e destinatários</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Spreadsheet ID */}
                  <div className="space-y-2">
                    <label htmlFor="spreadsheetId" className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <FileSpreadsheet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Planilha Google Sheets
                    </label>
                    <input
                      id="spreadsheetId"
                      type="text"
                      value={spreadsheetId}
                      onChange={e => handleFieldChange('spreadsheetId', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.spreadsheetId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                      placeholder="Cole o ID ou link da planilha"
                    />
                    {errors.spreadsheetId && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.spreadsheetId}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      A planilha deve ter as colunas: Nome (A) e Email (B)
                    </p>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Assunto do E-mail
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={subject}
                      onChange={e => handleFieldChange('subject', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
                      placeholder="Ex: Olá [Nome], temos uma oferta especial!"
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.subject}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use [Nome] para personalizar com o nome do destinatário
                    </p>
                  </div>

                  {/* Body */}
                  <div className="space-y-2">
                    <label htmlFor="body" className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Mensagem
                    </label>
                    <textarea
                      id="body"
                      value={body}
                      onChange={e => handleFieldChange('body', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.body ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all min-h-[150px] resize-y`}
                      placeholder="Digite sua mensagem aqui... Use [Nome] para personalizar!"
                    />
                    {errors.body && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.body}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium text-gray-900 dark:text-white"
                      disabled={!subject || !body}
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Ocultar' : 'Visualizar'} Preview
                    </button>
                    <button
                      type="submit"
                      disabled={status.type === 'loading'}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status.type === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar E-mails
                        </>
                      )}
                    </button>
                  </div>

                  {/* Status Message */}
                  {status.type !== 'idle' && (
                    <div className={`p-4 rounded-xl border ${
                      status.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' :
                      status.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' :
                      'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                    } transition-all`}>
                      <div className="flex items-start gap-3">
                        {status.type === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : status.type === 'error' ? (
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm font-medium ${
                          status.type === 'success' ? 'text-green-700 dark:text-green-300' :
                          status.type === 'error' ? 'text-red-700 dark:text-red-300' :
                          'text-blue-700 dark:text-blue-300'
                        }`}>
                          {status.message}
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Preview Section */}
              {showPreview && (subject || body) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 animate-in fade-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview da Mensagem</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Exemplo com o nome "João Silva"</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 p-6 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    {subject && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Assunto</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">{previewMessage.subject}</p>
                      </div>
                    )}
                    {body && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Mensagem</p>
                        <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{previewMessage.body}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <Sparkles className="w-8 h-8 mb-4" />
                <h3 className="text-lg font-bold mb-2">Dica de Personalização</h3>
                <p className="text-sm text-purple-100 mb-4">
                  Use a tag [Nome] no assunto ou mensagem para personalizar automaticamente com o nome de cada destinatário.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm">
                  <p className="font-mono">Olá [Nome],</p>
                  <p className="font-mono">Sua mensagem aqui...</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Como Funciona</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Configure a Planilha</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Coluna A: Nome, Coluna B: Email</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Escreva a Mensagem</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Use [Nome] para personalizar</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Envie</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">E-mails serão enviados automaticamente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        )}
      </main>
    </div>
  );
}