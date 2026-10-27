import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Mars Real Estate — início">
      <span className="relative grid size-8 place-items-center">
        <span className="absolute inset-0 orbit-ring" aria-hidden />
        <span className="size-4 rounded-full bg-gradient-mars shadow-glow" aria-hidden />
      </span>
      <span className="font-display text-lg font-semibold tracking-wide">
        MARS <span className="text-gradient-mars">REAL ESTATE</span>
      </span>
    </Link>
  );
}
