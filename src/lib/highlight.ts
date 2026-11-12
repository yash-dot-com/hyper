import ts from "typescript";

export type Token = { text: string; kind: string };
export function highlight(source: string): Token[][] {
  const file = ts.createSourceFile("component.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const lines: Token[][] = [[]];
  let cursor = 0;
  function emit(text: string, kind: string) {
    text.split("\n").forEach((part, index) => {
      if (index) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind });
    });
  }
  function visit(node: ts.Node) {
    const children = node.getChildren(file);
    if (children.length) { children.forEach(visit); return; }
    const start = node.getStart(file);
    if (start < cursor) return;
    emit(source.slice(cursor, start), "comment");
    const k = node.kind, K = ts.SyntaxKind, parent = node.parent;
    let kind = "plain";
    if (k >= K.FirstKeyword && k <= K.LastKeyword) kind = "keyword";
    else if (ts.isStringLiteralLike(node) || (k >= K.TemplateHead && k <= K.TemplateTail)) kind = "string";
    else if (ts.isNumericLiteral(node)) kind = "number";
    else if (ts.isIdentifier(node) && parent) {
      if (ts.isJsxAttribute(parent)) kind = "attr";
      else if (ts.isJsxOpeningElement(parent) || ts.isJsxClosingElement(parent) || ts.isJsxSelfClosingElement(parent)) kind = "tag";
      else if (ts.isFunctionDeclaration(parent) || /^\s*\(/.test(source.slice(node.end, node.end + 8))) kind = "fn";
      else if (/^[A-Z]/.test(node.text)) kind = "type";
    }
    emit(source.slice(start, node.end), kind);
    cursor = node.end;
  }
  visit(file);
  return lines;
}
