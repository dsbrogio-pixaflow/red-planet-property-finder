import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { Route as CatalogRoute } from "@/routes/terrenos.index";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("keeps the explicit discovery region in the catalog search", () => {
    const validate = CatalogRoute.options.validateSearch;
    if (typeof validate !== "function") throw new Error("Missing catalog search validator");
    expect(validate({ region: "arcadia-planitia", q: "habitat" })).toEqual({ region: "arcadia-planitia", q: "habitat" });
    expect(validate({ region: "unknown-region" })).toEqual({});
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
