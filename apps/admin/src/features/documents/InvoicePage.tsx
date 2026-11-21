import { useMemo, useState } from 'react';
import { Download, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/misc';
import { DocumentPreview } from './DocumentPreview';
import { printHtml } from './print';
import {
  addDays,
  billingPeriod,
  formatAmount,
  invoiceFileName,
  invoiceTotal,
  lineTotal,
  renderInvoice,
  toIsoDate,
  type InvoiceData,
  type InvoiceItem,
} from './templates';
import { readStored, useDraft, writeStored } from './use-draft';

const DRAFT_KEY = 'muvance.documents.invoice';
const NEXT_NO_KEY = 'muvance.documents.nextInvoiceNo';
const CLIENTS_KEY = 'muvance.documents.clients';
/** MVNC-271 was the last invoice made by hand, before this generator. */
const FIRST_NO = 272;

type SavedClient = Pick<
  InvoiceData,
  'clientCompany' | 'clientContact' | 'clientEmail' | 'clientAddress'
>;

const nextInvoiceNo = () => `MVNC-${readStored(NEXT_NO_KEY, FIRST_NO)}`;

function newItem(invoiceDate: string): InvoiceItem {
  return { name: 'Monthly media buying', note: billingPeriod(invoiceDate), qty: '1', unitPrice: '' };
}

function newInvoice(): InvoiceData {
  const today = toIsoDate(new Date());
  return {
    invoiceNo: nextInvoiceNo(),
    clientCompany: '',
    clientContact: '',
    clientEmail: '',
    clientAddress: '',
    items: [newItem(today)],
    invoiceDate: today,
    dueDate: addDays(today, 7),
  };
}

export function InvoicePage() {
  const [invoice, setInvoice, update] = useDraft(DRAFT_KEY, newInvoice);
  const [clients, setClients] = useState(() => readStored<SavedClient[]>(CLIENTS_KEY, []));
  const [printing, setPrinting] = useState(false);

  const html = useMemo(() => renderInvoice(invoice), [invoice]);
  const total = invoiceTotal(invoice.items);

  const setItem = (index: number, patch: Partial<InvoiceItem>) =>
    update(
      'items',
      invoice.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const pickClient = (company: string) => {
    update('clientCompany', company);
    const saved = clients.find((c) => c.clientCompany.toLowerCase() === company.toLowerCase());
    if (saved) setInvoice((current) => ({ ...current, ...saved }));
  };

  const changeInvoiceDate = (iso: string) =>
    setInvoice((current) => ({
      ...current,
      invoiceDate: iso,
      // Keep the usual 7-day terms unless the due date was changed by hand.
      dueDate:
        current.dueDate === addDays(current.invoiceDate, 7) ? addDays(iso, 7) : current.dueDate,
      // Same for a billing period that still matches the old date.
      items: current.items.map((item) =>
        item.note === billingPeriod(current.invoiceDate)
          ? { ...item, note: billingPeriod(iso) }
          : item,
      ),
    }));

  const problems = [
    !invoice.invoiceNo.trim() && 'an invoice number',
    !invoice.clientCompany.trim() && 'the client company',
    !invoice.items.some((item) => item.name.trim()) && 'at least one item',
    total <= 0 && 'a price',
  ].filter(Boolean);

  const download = async () => {
    if (problems.length) {
      toast.error(`Add ${problems.join(', ')} first.`);
      return;
    }
    setPrinting(true);
    try {
      await printHtml(html, invoiceFileName(invoice));

      // Remember the client for next time.
      const client: SavedClient = {
        clientCompany: invoice.clientCompany.trim(),
        clientContact: invoice.clientContact.trim(),
        clientEmail: invoice.clientEmail.trim(),
        clientAddress: invoice.clientAddress.trim(),
      };
      const nextClients = [
        client,
        ...clients.filter(
          (c) => c.clientCompany.toLowerCase() !== client.clientCompany.toLowerCase(),
        ),
      ];
      setClients(nextClients);
      writeStored(CLIENTS_KEY, nextClients);

      // Move the counter past this number.
      const used = Number(/(\d+)\s*$/.exec(invoice.invoiceNo)?.[1]);
      if (used >= readStored(NEXT_NO_KEY, FIRST_NO)) writeStored(NEXT_NO_KEY, used + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create the PDF.');
    } finally {
      setPrinting(false);
    }
  };

  const startNew = () => {
    if (!window.confirm('Clear this invoice and start a new one?')) return;
    setInvoice(newInvoice());
  };

  return (
    <>
      <PageHeader
        title="Invoice"
        description='Fill in the details and download. In the print window, choose "Save as PDF".'
        actions={
          <>
            <Button variant="secondary" onClick={startNew}>
              <RotateCcw className="size-4" aria-hidden />
              New invoice
            </Button>
            <Button onClick={download} loading={printing}>
              <Download className="size-4" aria-hidden />
              Download PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Invoice" />
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <Field label="Invoice no." hint={`Next: ${nextInvoiceNo()}`}>
                {(p) => (
                  <Input
                    {...p}
                    value={invoice.invoiceNo}
                    onChange={(e) => update('invoiceNo', e.target.value.replace(/\s/g, ''))}
                  />
                )}
              </Field>
              <Field label="Invoice date">
                {(p) => (
                  <Input
                    {...p}
                    type="date"
                    value={invoice.invoiceDate}
                    onChange={(e) => changeInvoiceDate(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Due date">
                {(p) => (
                  <Input
                    {...p}
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => update('dueDate', e.target.value)}
                  />
                )}
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="Client" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field
                label="Company"
                hint={clients.length ? 'Pick a past client to fill in their details.' : undefined}
                className="sm:col-span-2"
              >
                {(p) => (
                  <>
                    <Input
                      {...p}
                      list="invoice-clients"
                      autoComplete="off"
                      placeholder="Bosphorus Clothing"
                      value={invoice.clientCompany}
                      onChange={(e) => pickClient(e.target.value)}
                    />
                    <datalist id="invoice-clients">
                      {clients.map((c) => (
                        <option key={c.clientCompany} value={c.clientCompany} />
                      ))}
                    </datalist>
                  </>
                )}
              </Field>
              <Field label="Contact person">
                {(p) => (
                  <Input
                    {...p}
                    placeholder="Mushfeq Islam"
                    value={invoice.clientContact}
                    onChange={(e) => update('clientContact', e.target.value)}
                  />
                )}
              </Field>
              <Field label="Email">
                {(p) => (
                  <Input
                    {...p}
                    type="email"
                    placeholder="name@company.com"
                    value={invoice.clientEmail}
                    onChange={(e) => update('clientEmail', e.target.value)}
                  />
                )}
              </Field>
              <Field label="Address" hint="One line per row." className="sm:col-span-2">
                {(p) => (
                  <Textarea
                    {...p}
                    rows={3}
                    placeholder={'Road 2, House 8, J Block\nBaridhara, Dhaka\nBangladesh'}
                    value={invoice.clientAddress}
                    onChange={(e) => update('clientAddress', e.target.value)}
                  />
                )}
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Items"
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    update('items', [
                      ...invoice.items,
                      { name: '', note: '', qty: '1', unitPrice: '' },
                    ])
                  }
                >
                  <Plus className="size-3.5" aria-hidden />
                  Add item
                </Button>
              }
            />
            <div className="divide-y divide-hud/10">
              {invoice.items.map((item, i) => (
                <div key={i} className="grid gap-3 p-5 sm:grid-cols-6">
                  <Field label="Item" className="sm:col-span-3">
                    {(p) => (
                      <Input
                        {...p}
                        value={item.name}
                        onChange={(e) => setItem(i, { name: e.target.value })}
                      />
                    )}
                  </Field>
                  <Field label="Note" hint="Optional, e.g. billing period" className="sm:col-span-3">
                    {(p) => (
                      <Input
                        {...p}
                        value={item.note}
                        onChange={(e) => setItem(i, { note: e.target.value })}
                      />
                    )}
                  </Field>
                  <Field label="Qty" className="sm:col-span-1">
                    {(p) => (
                      <Input
                        {...p}
                        inputMode="decimal"
                        value={item.qty}
                        onChange={(e) => setItem(i, { qty: e.target.value })}
                      />
                    )}
                  </Field>
                  <Field label="Unit price (BDT)" className="sm:col-span-2">
                    {(p) => (
                      <Input
                        {...p}
                        inputMode="decimal"
                        placeholder="10,000"
                        value={item.unitPrice}
                        onChange={(e) => setItem(i, { unitPrice: e.target.value })}
                      />
                    )}
                  </Field>
                  <div className="flex items-end justify-between gap-3 sm:col-span-3">
                    <p className="pb-2.5 text-sm text-neutral-500">
                      Line total{' '}
                      <span className="font-medium text-neutral-950 tabular-nums">
                        BDT {formatAmount(lineTotal(item))}
                      </span>
                    </p>
                    {invoice.items.length > 1 && (
                      <Button
                        variant="danger-ghost"
                        size="icon"
                        aria-label="Remove item"
                        title="Remove item"
                        onClick={() =>
                          update(
                            'items',
                            invoice.items.filter((_, j) => j !== i),
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-baseline justify-between border-t border-hud/15 px-5 py-4">
              <span className="hud-label text-hud">Total</span>
              <span className="text-xl font-semibold text-neutral-950 tabular-nums">
                BDT {formatAmount(total)}
              </span>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <DocumentPreview html={html} title="Invoice preview" />
        </div>
      </div>
    </>
  );
}
