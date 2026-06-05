// Class names mentioned only in COMMENTS must not inflate the score.
// Avoid: p-16, rounded-2xl, shadow-2xl, px-20.
export function Card() {
  /* block note: p-24 and rounded-3xl are discouraged here */
  return (
    <div className="p-4 rounded border">
      {/* JSX comment: shadow-2xl looks AI-made */}
      <span>content</span>
    </div>
  );
}
