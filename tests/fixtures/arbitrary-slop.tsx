// Sophisticated slop that dodges the rounded-2xl/shadow-2xl rules with
// arbitrary Tailwind values and an off-palette gradient. Must still be caught.
export function Hero() {
  return (
    <div className="rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] bg-gradient-to-r from-fuchsia-500 to-rose-500">
      <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-400">Hi</h1>
      <section className="backdrop-blur-xl">glass</section>
    </div>
  );
}
