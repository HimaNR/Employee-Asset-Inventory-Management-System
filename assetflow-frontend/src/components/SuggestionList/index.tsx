/**
 * Native browser suggestions for an <input list={id}>.
 * Example: typing "De" in Brand offers "Dell" if Dell was used before.
 */
export default function SuggestionList({ id, values }: { id: string; values: string[] }) {
  return (
    <datalist id={id}>
      {values.map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}
