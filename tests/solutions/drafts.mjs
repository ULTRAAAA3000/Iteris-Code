// Збирає еталони й мутації чернеток проєктів усіх курсів
import { CPP_MUTATIONS, CPP_SOLUTIONS } from "./drafts-cpp.mjs";
import { HTML_MUTATIONS, HTML_SOLUTIONS } from "./drafts-html.mjs";
import { PASCAL_MUTATIONS, PASCAL_SOLUTIONS } from "./drafts-pascal.mjs";

export const DRAFT_SOLUTIONS = { ...CPP_SOLUTIONS, ...PASCAL_SOLUTIONS, ...HTML_SOLUTIONS };
export const DRAFT_MUTATIONS = { ...CPP_MUTATIONS, ...PASCAL_MUTATIONS, ...HTML_MUTATIONS };
