function SeasonSelector({ seasons = [], selectedSeason, onChange }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-md">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Select Season
      </label>

      <select
        value={selectedSeason}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-gray-300 p-3"
      >
        {seasons.map((season) => (
          <option key={season} value={season}>
            {season}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SeasonSelector;