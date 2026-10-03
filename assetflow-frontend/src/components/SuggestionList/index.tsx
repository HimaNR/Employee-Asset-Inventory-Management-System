/**
 * Native browser suggestions for an <input list={id}>.
 * Example: typing "De" in Brand offers "Dell" if Dell was used before.
 */
export default function SuggestionList({ id, values }: { id: string; values?: string[] | null }) {
  return (
    <datalist id={id}>
      {/* Defensive: never crash a form if suggestions are missing */}
      {(values ?? []).map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}
