export default function Flag({ code }: { code: string | null }) {
  if (!code) return null;

  try {
    const chars = [...code]; // split por codepoint, no por char
    const iso = chars
      .map((c) => {
        const cp = c.codePointAt(0) ?? 0;
        if (cp < 0x1f1e6 || cp > 0x1f1ff) return null; // no es emoji de bandera
        return String.fromCodePoint(cp - 0x1f1e6 + 65);
      })
      .filter(Boolean)
      .join("")
      .toLowerCase();

    if (iso.length !== 2) return null;

    return (
      <img
        src={`https://flagcdn.com/w20/${iso}.png`}
        alt={iso}
        width={20}
        height={15}
        className="inline-block rounded-sm"
      />
    );
  } catch {
    return null;
  }
}
