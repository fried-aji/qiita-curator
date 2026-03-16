import { setupServer } from "msw/node";
import { qiitaHandlers } from "./handlers/qiita";

export const server = setupServer(...qiitaHandlers);
