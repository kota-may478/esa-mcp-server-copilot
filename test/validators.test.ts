import { describe, expect, it } from "vitest";

import {
  parseDeletePostInput,
  parseListPostsInput,
  parseUpdatePostInput,
} from "../src/mcp/validators.js";

describe("validators", () => {
  it("esa_delete_post は confirm=true を必須にする", () => {
    expect(() =>
      parseDeletePostInput({
        post_number: 10,
        confirm: false,
      }),
    ).toThrowError(/confirm=true/);

    const parsed = parseDeletePostInput({
      post_number: 10,
      confirm: true,
      reason: "誤って作成された記事のため",
    });

    expect(parsed.post_number).toBe(10);
    expect(parsed.confirm).toBe(true);
  });

  it("esa_update_post は更新項目が1つ以上必要", () => {
    expect(() =>
      parseUpdatePostInput({
        post_number: 99,
      }),
    ).toThrowError(/少なくとも1つ/);

    const parsed = parseUpdatePostInput({
      post_number: 99,
      name: "更新後タイトル",
    });

    expect(parsed.post_number).toBe(99);
    expect(parsed.name).toBe("更新後タイトル");
  });

  it("esa_list_posts はデフォルト値を補完する", () => {
    const parsed = parseListPostsInput({
      q: "wip:false",
    });

    expect(parsed.per_page).toBe(20);
    expect(parsed.page).toBe(1);
    expect(parsed.q).toBe("wip:false");
  });
});
