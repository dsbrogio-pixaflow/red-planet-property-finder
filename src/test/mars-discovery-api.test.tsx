import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MarsRegionList } from "@/components/discover/MarsRegionList";
import type { ApiProperty } from "@/types/api";

describe("Discovery region counts", () => {
  it("renders the published API inventory and preserves selection", () => {
    // These are the only API fields used to associate a listing with a region.
    const properties = [
      { sectorName: "Arcadia Planitia", status: "PUBLISHED" },
      { sectorName: "Arcadia Planitia", status: "SOLD" },
      { sectorName: "Setor Norte", status: "PUBLISHED" },
    ] as ApiProperty[];
    const onSelect = vi.fn();
    render(<MarsRegionList selectedId="olympus-mons" onSelect={onSelect} properties={properties} />);

    const arcadia = screen.getByRole("button", { name: /Arcadia Planitia 1 terreno/ });
    expect(screen.getByRole("button", { name: "Tharsis" })).toBeInTheDocument();
    fireEvent.click(arcadia);
    expect(onSelect).toHaveBeenCalledWith("arcadia-planitia");
  });
});
