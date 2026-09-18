import type { StructureResolver } from "sanity/structure";

const documentList = (S: Parameters<StructureResolver>[0], type: string, title: string) =>
  S.documentTypeList(type).title(title).filter(`_type == "${type}"`);

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title("Flight Offer Expert")
    .items([
      S.listItem().title("Knowledge articles").child(documentList(S, "policyArticle", "Policy articles")),
      S.listItem().title("Glossary").child(documentList(S, "glossaryTerm", "Glossary terms")),
      S.divider(),
      S.listItem().title("Airlines").child(documentList(S, "airline", "Airlines")),
      S.listItem().title("Airports").child(documentList(S, "airport", "Airports")),
    ]);
