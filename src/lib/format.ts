export function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function ageOf(birth: string, end?: string | null) {
  const b = new Date(birth + "T00:00:00");
  const e = end ? new Date(end + "T00:00:00") : new Date();
  let age = e.getFullYear() - b.getFullYear();
  const m = e.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && e.getDate() < b.getDate())) age--;
  return age;
}