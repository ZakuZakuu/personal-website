export default function rehypeFocusableKatex() {
  return (tree) => {
    visit(tree);
  };
}

function visit(node) {
  if (node?.type === 'element' && node.properties?.className?.includes('katex-display')) {
    node.properties.tabIndex = 0;
  }

  // Tables scroll horizontally at narrow widths, so keyboard users need to reach them too.
  if (node?.type === 'element' && node.tagName === 'table') {
    node.properties = { ...node.properties, tabIndex: 0 };
  }

  if (Array.isArray(node?.children)) {
    for (const child of node.children) visit(child);
  }
}
