export default function rehypeFocusableKatex() {
  return (tree) => {
    visit(tree);
  };
}

function visit(node) {
  if (node?.type === 'element' && node.properties?.className?.includes('katex-display')) {
    node.properties.tabIndex = 0;
  }

  if (Array.isArray(node?.children)) {
    for (const child of node.children) visit(child);
  }
}
