import { atomWithStorage } from "jotai/utils";

// localStorageに永続化されるブックマークID配列
export const bookmarkedIdsAtom = atomWithStorage<string[]>("bookmarks", []);
