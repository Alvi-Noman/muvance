import { Card, CardHeader } from '@/components/ui/Card';
import { RecordingRow } from './RecordingRow';
import { useRecordings } from './recordings-api';

/** A lead's recorded website visits (shown once there are any). */
export function WebsiteVisitsCard({ leadId }: { leadId: string }) {
  const { data } = useRecordings({ leadId, pageSize: 20 });
  if (!data?.items.length) return null;
  return (
    <Card>
      <CardHeader
        title="Website visits"
        description={`${data.total} recorded ${data.total === 1 ? 'visit' : 'visits'}. Watch what they looked at.`}
      />
      <ul className="divide-y divide-black/[0.05]">
        {data.items.map((rec) => (
          <RecordingRow key={rec.id} rec={rec} showLead={false} />
        ))}
      </ul>
    </Card>
  );
}
