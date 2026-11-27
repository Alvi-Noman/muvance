import type { ChatPersonDto } from '@muvance/shared';

/**
 * In the composer people see "@Sara Khan"; messages store "<@id>". These convert between the two,
 * matching the names of the people in the conversation (longest names first).
 */
export function toStored(text: string, members: ChatPersonDto[], allowAll: boolean) {
  const sorted = [...members].sort((a, b) => b.name.length - a.name.length);
  let out = text;
  for (const p of sorted) {
    if (!p.name) continue;
    const escaped = p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(
      new RegExp(`(^|[^\\p{L}\\p{N}])@${escaped}(?![\\p{L}\\p{N}])`, 'gu'),
      `$1<@${p.id}>`,
    );
  }
  if (allowAll) out = out.replace(/(^|[^\p{L}\p{N}])@all(?![\p{L}\p{N}])/gu, '$1<@all>');
  return out;
}

export function toEditable(text: string, people: Map<string, ChatPersonDto>) {
  return text
    .replace(/<@all>/g, '@all')
    .replace(/<@([a-f\d]{24})>/g, (_m, id: string) => `@${people.get(id)?.name ?? 'someone'}`);
}
