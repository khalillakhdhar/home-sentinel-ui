import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchGasReading, fetchPresenceReading } from "@/lib/ubidots";

describe("Ubidots sensor mapping", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["presence", fetchPresenceReading, "distance"],
    ["gas", fetchGasReading, "niveau"],
  ])("reads the %s variable from the shared device", async (_, fetchReading, label) => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes("/datasources/")) {
        expect(url).toContain(
          "/datasources/6ab3f18ad9a4ad0a6abf214a/variables",
        );
        return new Response(
          JSON.stringify({ results: [{ id: `variable-${label}`, label }] }),
          { status: 200 },
        );
      }

      expect(url).toContain(`/variables/variable-${label}/values`);
      return new Response(
        JSON.stringify({
          results: [{ value: 1, timestamp: 1, created_at: 1 }],
        }),
        { status: 200 },
      );
    });

    await fetchReading(1);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
