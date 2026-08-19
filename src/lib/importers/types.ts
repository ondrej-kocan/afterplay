import type { ListeningSource, Play } from "@/lib/listening/play";

export type ImportResult = {
  source: ListeningSource;
  plays: Play[];
  warnings: string[];
};

export interface ListeningHistoryImporter {
  readonly source: ListeningSource;
  canImport(file: File): boolean;
  import(file: File): Promise<ImportResult>;
}
