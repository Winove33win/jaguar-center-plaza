import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Container from '../components/layout/Container';
import { submitLibrasLead } from '../lib/api';
import { useSEO } from '../hooks/useSEO';

const schema = z.object({
  name: z.string().min(3, 'Informe pelo menos 3 caracteres.'),
  email: z.string().email('Informe um e-mail válido.'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Descreva a sua necessidade com pelo menos 10 caracteres.'),
  companyId: z.string().optional()
});

type ContactFormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const form = useForm<ContactFormValues>({ resolver: zodResolver(schema), defaultValues: { companyId: '' } });

  const mutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const interest = values.companyId ? `Interesse: ${values.companyId}` : '';
      const message = [values.message, interest].filter(Boolean).join('\n\n');
      await submitLibrasLead({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message,
        source: 'contact'
      });
    },
    onSuccess: () => {
      setResult({ type: 'success', message: 'Recebemos a sua mensagem! Em breve nossa equipe entrará em contato.' });
      form.reset();
    },
    onError: () => {
      setResult({ type: 'error', message: 'Não foi possível enviar sua mensagem agora. Tente novamente em instantes.' });
    }
  });

  useSEO({
    title: 'Contato — Jaguar Center Plaza',
    description:
      'Fale com a equipe do Jaguar Center Plaza para agendar visitas, eventos e oportunidades comerciais.',
    canonical: 'https://www.jaguarcenterplaza.com.br/contato'
  });

  const onSubmit = (values: ContactFormValues) => {
    setResult(null);
    mutation.mutate(values);
  };

  return (
    <section>
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Contato</p>
          <h1 className="section-title">Conecte sua marca ao Jaguar Center Plaza</h1>
          <p className="section-subtitle">
            Preencha o formulário ao lado para agendar uma visita guiada, solicitar propostas de locação ou construir
            parcerias estratégicas. Nossa equipe comercial está pronta para entender sua necessidade e indicar o melhor
            espaço dentro do complexo.
          </p>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Informações de contato</h2>
            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              <li>
                <p className="font-semibold text-slate-800">Jaguar Center Plaza</p>
                <p>Rua Cândido Bueno, 1299 · Centro · Jaguariúna/SP</p>
                <p>Segunda a sexta-feira: 7h às 21h · Sábados: 8h às 14h</p>
              </li>
              <li>
                <p className="font-semibold text-slate-800">Fale com a gente</p>
                <p>Telefone: (19) 3837-3391</p>
                <p>E-mail: jaguarcenterplaza@hotmail.com</p>
              </li>
              <li>
                <p className="font-semibold text-slate-800">Atendimento ao cliente</p>
                <p>jaguarcenterplaza@hotmail.com</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="name">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                  E-mail corporativo
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
                  Telefone
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="(11) 0000-0000"
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  {...form.register('phone')}
                />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700" htmlFor="companyId">
                  Interesse principal
                </label>
                <select
                  id="companyId"
                  className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  {...form.register('companyId')}
                >
                  <option value="">Selecionar</option>
                  <option value="visita">Agendar visita técnica</option>
                  <option value="locacao">Locação de espaço</option>
                  <option value="eventos">Eventos e ativações</option>
                  <option value="parcerias">Parcerias comerciais</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="message">
                Conte-nos como podemos ajudar
              </label>
              <textarea
                id="message"
                rows={5}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                {...form.register('message')}
              />
              {form.formState.errors.message && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.message.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mutation.isPending ? 'Enviando...' : 'Enviar mensagem'}
            </button>
            {result && (
              <p
                className={`text-sm ${result.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}
                role={result.type === 'success' ? 'status' : 'alert'}
              >
                {result.message}
              </p>
            )}
          </form>
        </div>
      </Container>
    </section>
  );
}
