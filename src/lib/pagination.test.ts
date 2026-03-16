import { describe, it, expect } from "vitest";
import { getPaginationRange } from "./pagination";

describe("getPaginationRange", () => {
  it("totalPagesが5以下の場合は全ページを返す", () => {
    expect(getPaginationRange(1, 3)).toEqual([1, 2, 3]);
    expect(getPaginationRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("page=1: [1,2,3,4,5]を返す", () => {
    expect(getPaginationRange(1, 20)).toEqual([1, 2, 3, 4, 5]);
  });

  it("page=2: [1,2,3,4,5]を返す", () => {
    expect(getPaginationRange(2, 20)).toEqual([1, 2, 3, 4, 5]);
  });

  it("page=3: [1,2,3,4,5]を返す", () => {
    expect(getPaginationRange(3, 20)).toEqual([1, 2, 3, 4, 5]);
  });

  it("page=10: [8,9,10,11,12]を返す", () => {
    expect(getPaginationRange(10, 20)).toEqual([8, 9, 10, 11, 12]);
  });

  it("page=19: [16,17,18,19,20]を返す", () => {
    expect(getPaginationRange(19, 20)).toEqual([16, 17, 18, 19, 20]);
  });

  it("page=20: [16,17,18,19,20]を返す", () => {
    expect(getPaginationRange(20, 20)).toEqual([16, 17, 18, 19, 20]);
  });
});
