interface CodeBlockProps {
  children: string;
  /** Describes what the sample shows, for someone who reaches it by keyboard. */
  label?: string;
}

/**
 * A code sample that a keyboard user can scroll.
 *
 * A long sample overflows horizontally on a narrow screen. A pointer user can
 * swipe it, but a scrollable box with nothing focusable inside is unreachable
 * by keyboard, so `tabIndex` puts it in the tab order and the group role and
 * label say what the reader has landed on.
 */
export function CodeBlock({ children, label = 'Code example' }: CodeBlockProps) {
  return (
    <pre className="html-css-code" tabIndex={0} role="group" aria-label={label}>
      <code>{children}</code>
    </pre>
  );
}
