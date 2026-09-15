import { readFileSync } from "node:fs";
import path from "node:path";

const referencesDirectory = path.resolve(
  process.cwd(),
  "../skills/modern-web-ui/references"
);

const fieldSizingId = "field-sizing";
const decisionsHeading = "## Decisions that matter";
const defaultStageWidth = 700;

// A stage is not "as wide as possible". The container-card slider spans 55-100% of its
// container, so that container has to straddle the recipe's own 320px breakpoint or the
// demo only ever shows one of its two layouts. The others simply want room.
const stageWidths: Record<string, number> = {
  "field-sizing": 720,
  "container-card": 560,
  "has-selection": 620,
  "native-dialog": 700,
  "url-parser": 700,
};

/**
One run of reference prose: either plain text or an inline code span.
*/
export interface Segment {
  readonly value: string;
  readonly isCode: boolean;
}

export interface RecipeDocumentation {
  readonly label: string;
  readonly href: string;
}

export interface Notes {
  readonly decisions: readonly (readonly Segment[])[];
  readonly docs: RecipeDocumentation | null;
}

const readReference = (fileName: string): string => {
  const filePath = path.resolve(referencesDirectory, fileName);
  return readFileSync(filePath, "utf-8").replaceAll("\r\n", "\n");
};

/**
Splits reference prose on backticks so inline code renders as real markup.
*/
const toSegments = (line: string): readonly Segment[] => {
  const parts = line.split("`");
  return parts
    .map((value, index) => ({ value, isCode: index % 2 === 1 }))
    .filter((segment) => segment.value.length > 0);
};

/**
One sentence reads as one point. Avoids a lookbehind, which `compat` rejects.
*/
const toSentences = (cell: string): readonly string[] => {
  const parts = cell.split(". ");
  return parts
    .map((part, index) =>
      index < parts.length - 1 ? `${part.trim()}.` : part.trim()
    )
    .filter((part) => part.length > 0);
};

const fieldSizingDecisions = (): readonly string[] => {
  const body = readReference("field-sizing.md");
  const afterHeading = body.split(decisionsHeading)[1] ?? "";
  const section = afterHeading.split("\n## ", 1)[0] ?? "";
  return section
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
};

const showcaseRow = (id: string): string | undefined => {
  const marker = `/assets/${id}.html`;
  return readReference("showcase-recipes.md")
    .split("\n")
    .find((line) => line.startsWith("|") && line.includes(marker));
};

/**
Pulls `[label](href)` out of a table cell without a backtracking pattern.
*/
const parseLink = (cell: string): RecipeDocumentation | null => {
  const labelStart = cell.indexOf("[");
  const labelEnd = cell.indexOf("](", labelStart + 1);
  const hrefEnd = cell.indexOf(")", labelEnd + 2);
  if (labelStart === -1 || labelEnd === -1 || hrefEnd === -1) {
    return null;
  }
  return {
    label: cell.slice(labelStart + 1, labelEnd),
    href: cell.slice(labelEnd + 2, hrefEnd),
  };
};

/**
 * Reads a recipe's important decisions and its upstream documentation link from the
 * skill's own reference files, so a page cannot drift from the skill it documents.
 * field-sizing keeps a prose section of its own; the rest share one table.
 */
export const notesFor = (id: string): Notes => {
  if (id === fieldSizingId) {
    return {
      decisions: fieldSizingDecisions().map(toSegments),
      docs: {
        label: "MDN field-sizing",
        href: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/field-sizing",
      },
    };
  }

  const row = showcaseRow(id);
  if (row === undefined) {
    return { decisions: [], docs: null };
  }

  const cells = row
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);

  return {
    decisions: toSentences(cells[4] ?? "").map(toSegments),
    docs: parseLink(cells[3] ?? ""),
  };
};

/**
Width the demo stage is capped at, chosen per recipe. See `stageWidths`.
*/
export const stageWidthFor = (id: string): number =>
  stageWidths[id] ?? defaultStageWidth;
