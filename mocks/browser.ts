import { setupWorker } from "msw/browser";
import { qiitaHandlers } from "./handlers/qiita";

export const worker = setupWorker(...qiitaHandlers);
