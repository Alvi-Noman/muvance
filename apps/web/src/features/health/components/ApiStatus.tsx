import { cn } from '@/lib/cn';
import { useHealth } from '../hooks/use-health';

export function ApiStatus() {
  const { data, isPending, isError } = useHealth();

  const label = isPending ? 'Checking API...' : isError ? 'API unreachable' : 'API online';
  const color = isPending ? 'bg-amber-400' : isError ? 'bg-red-500' : 'bg-emerald-500';

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm ring-1 ring-slate-200">
      <span className={cn('size-2 rounded-full', color)} />
      {label}
      {data && <span className="text-slate-400">· up {Math.round(data.uptime)}s</span>}
    </div>
  );
}
