function StatCard({ title, value }) {
  return (
    <div className="analytics-panel relative overflow-hidden">
      <div aria-hidden="true" className="absolute left-0 top-6 h-8 w-0.5 bg-red-500" />
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</h3>
      <p className="mt-4 break-words text-3xl font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

export default StatCard;
