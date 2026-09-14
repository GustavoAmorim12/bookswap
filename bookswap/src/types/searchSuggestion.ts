export type SearchSuggestion = {
  id: string;
  label: string;
  description: string;
  to: string;
  kind: "anuncio" | "disciplina";
};
