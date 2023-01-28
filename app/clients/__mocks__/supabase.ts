import { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";

beforeEach(() => {
  mockReset(supabase);

  const upload = vi.fn().mockResolvedValue({});
  const getPublicUrl = vi.fn().mockReturnValue({
    data: {
      publicUrl: "mock-supabase-public-url",
    },
  });
  const remove = vi.fn().mockResolvedValue({});

  // @ts-expect-error: Dont want to add every function
  supabase.storage.from.mockReturnValue({
    upload,
    getPublicUrl,
    remove,
  });
});

const supabase = mockDeep<SupabaseClient>();

export default supabase;
