import { useMemo, useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/misc';
import { DocumentPreview } from './DocumentPreview';
import { printHtml } from './print';
import signatureUrl from './signature.png';
import {
  addDays,
  offerFileName,
  parseDate,
  renderOffer,
  toIsoDate,
  type OfferData,
} from './templates';
import { useDraft } from './use-draft';

const DRAFT_KEY = 'muvance.documents.offer';

const referenceFor = (iso: string) => {
  const d = parseDate(iso) ?? new Date();
  return `MD/HR/OL/${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function newOffer(): OfferData {
  const today = toIsoDate(new Date());
  return {
    candidateName: '',
    candidateFirstName: '',
    designation: '',
    issueDate: today,
    referenceNo: referenceFor(today),
    reportsTo: '',
    joiningDate: '',
    workingDays: 'Saturday to Thursday (6 days a week), Friday off',
    officeHours: '11:00 AM – 7:00 PM',
    probation: '3 months from the date of joining',
    monthlySalary: '',
    responsibilities: '',
    acceptByDate: addDays(today, 10),
  };
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

export function OfferLetterPage() {
  const [offer, setOffer, update] = useDraft(DRAFT_KEY, newOffer);
  const [printing, setPrinting] = useState(false);

  // The signature has to be an absolute URL inside the print frame.
  const html = useMemo(
    () => renderOffer(offer, new URL(signatureUrl, window.location.href).href),
    [offer],
  );

  const changeName = (name: string) =>
    setOffer((current) => ({
      ...current,
      candidateName: name,
      // Follow the full name until the first name is edited by hand.
      candidateFirstName:
        current.candidateFirstName === firstName(current.candidateName)
          ? firstName(name)
          : current.candidateFirstName,
    }));

  const changeIssueDate = (iso: string) =>
    setOffer((current) => ({
      ...current,
      issueDate: iso,
      referenceNo:
        current.referenceNo === referenceFor(current.issueDate)
          ? referenceFor(iso)
          : current.referenceNo,
      acceptByDate:
        current.acceptByDate === addDays(current.issueDate, 10)
          ? addDays(iso, 10)
          : current.acceptByDate,
    }));

  const problems = [
    !offer.candidateName.trim() && "the candidate's name",
    !offer.designation.trim() && 'the designation',
    !offer.joiningDate && 'the joining date',
    !offer.monthlySalary.trim() && 'the salary',
  ].filter(Boolean);

  const download = async () => {
    if (problems.length) {
      toast.error(`Add ${problems.join(', ')} first.`);
      return;
    }
    setPrinting(true);
    try {
      await printHtml(html, offerFileName(offer));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create the PDF.');
    } finally {
      setPrinting(false);
    }
  };

  const startNew = () => {
    if (!window.confirm('Clear this offer letter and start a new one?')) return;
    setOffer(newOffer());
  };

  const text = (field: keyof OfferData, label: string, placeholder?: string, hint?: string) => (
    <Field label={label} hint={hint}>
      {(p) => (
        <Input
          {...p}
          placeholder={placeholder}
          value={offer[field]}
          onChange={(e) => update(field, e.target.value)}
        />
      )}
    </Field>
  );

  const date = (field: keyof OfferData, label: string, onChange = (v: string) => update(field, v)) => (
    <Field label={label}>
      {(p) => (
        <Input {...p} type="date" value={offer[field]} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );

  return (
    <>
      <PageHeader
        title="Offer letter"
        description='Fill in the details and download. In the print window, choose "Save as PDF".'
        actions={
          <>
            <Button variant="secondary" onClick={startNew}>
              <RotateCcw className="size-4" aria-hidden />
              New offer
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
            <CardHeader title="Candidate" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Full name">
                {(p) => (
                  <Input
                    {...p}
                    placeholder="Prottasha Mehbuba Abedin"
                    value={offer.candidateName}
                    onChange={(e) => changeName(e.target.value)}
                  />
                )}
              </Field>
              {text('candidateFirstName', 'Greeting name', 'Prottasha', 'Used in “Dear …,”')}
              {text('designation', 'Designation', 'Business Development Executive')}
              {text('reportsTo', 'Reports to', 'Business Development Manager')}
            </div>
          </Card>

          <Card>
            <CardHeader title="Letter" />
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {date('issueDate', 'Date of issue', changeIssueDate)}
              {text('referenceNo', 'Reference')}
              {date('acceptByDate', 'Accept by')}
            </div>
          </Card>

          <Card>
            <CardHeader title="Terms" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {date('joiningDate', 'Date of joining')}
              {text('monthlySalary', 'Monthly salary, gross (BDT)', '25,000')}
              {text('workingDays', 'Working days')}
              {text('officeHours', 'Office hours')}
              <div className="sm:col-span-2">{text('probation', 'Probation')}</div>
              <Field
                label="Responsibilities"
                hint="One per line. Each line becomes a bullet point."
                className="sm:col-span-2"
              >
                {(p) => (
                  <Textarea
                    {...p}
                    rows={5}
                    placeholder={
                      'Follow up on incoming leads and convert them into clients.\nRun discovery calls and meetings with prospective clients by video call and phone.'
                    }
                    value={offer.responsibilities}
                    onChange={(e) => update('responsibilities', e.target.value)}
                  />
                )}
              </Field>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <DocumentPreview html={html} title="Offer letter preview" />
        </div>
      </div>
    </>
  );
}
