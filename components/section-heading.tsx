export function SectionHeading({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="section-heading"><div><p className="eyebrow"><span>{number}</span> {eyebrow}</p><h2>{title}</h2></div>{children}</div>;
}
