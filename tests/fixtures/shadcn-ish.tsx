// shadcn/ui-flavored component with a couple of mild slop tells: a default
// big-radius card and one heavy shadow. The circular avatar is acceptable.
export function FeatureCard() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-2xl">
      <img className="h-10 w-10 rounded-full" alt="" />
      <h3 className="text-lg font-semibold">Powerful Features</h3>
      <p className="text-sm text-muted-foreground">Get started in seconds.</p>
    </div>
  );
}
