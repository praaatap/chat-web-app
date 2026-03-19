export function WorkspaceMetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="text-xl font-black text-zinc-900">{value}</p>
    </div>
  );
}
