// ty sol
import {
  NodeType,
  parse,
  type HTMLElement,
  type TextNode,
} from "node-html-parser";

export function truncateHtml(html: string, limit = 512): string {
  const root = parse(html);

  let remaining = limit;
  let truncated = false;
  let lastTextNode: TextNode | undefined;

  const removeAfter = (parent: HTMLElement, index: number): void => {
    for (let i = parent.childNodes.length - 1; i > index; i--) {
      parent.childNodes[i].remove();
    }
  };

  const walk = (node: HTMLElement): boolean => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];

      if (child.nodeType === NodeType.TEXT_NODE) {
        const textNode = child as TextNode;
        const text = textNode.rawText;

        lastTextNode = textNode;

        if (text.length <= remaining) {
          remaining -= text.length;
          continue;
        }

        textNode.rawText = text.slice(0, remaining);
        remaining = 0;
        truncated = true;

        removeAfter(node, i);
        return true;
      }

      if (child.nodeType === NodeType.ELEMENT_NODE) {
        if (walk(child as HTMLElement)) {
          removeAfter(node, i);
          return true;
        }
      }
    }

    return false;
  };

  walk(root);

  if (truncated && lastTextNode) {
    lastTextNode.rawText += "...";
  }

  return root.toString();
}
