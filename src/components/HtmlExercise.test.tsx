import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { hasDoctype, hasLangAttribute, headingOrderIsSound } from '@/lib/htmlChecks';
import { HtmlExercise } from './HtmlExercise';

const STARTER = '<html><body><h2>Wrong</h2></body></html>';
const SOLUTION = '<!DOCTYPE html><html lang="en"><body><h1>Right</h1></body></html>';

function renderExercise(overrides: Partial<Parameters<typeof HtmlExercise>[0]> = {}) {
  const props = {
    storageKey: 'exercise-test',
    title: 'Fix the document',
    brief: <p>Add what the browser needs.</p>,
    starter: STARTER,
    checks: [hasDoctype(), hasLangAttribute(), headingOrderIsSound()],
    solution: SOLUTION,
    solutionExplanation: <p>The doctype and language belong at the top.</p>,
    onCorrect: vi.fn(),
    ...overrides,
  };
  const view = render(<HtmlExercise {...props} />);
  return { ...props, ...view };
}

function type(value: string) {
  fireEvent.change(screen.getByLabelText('Your HTML'), { target: { value } });
}

describe('HtmlExercise', () => {
  beforeEach(() => localStorage.clear());

  test('opens with the starter markup', () => {
    renderExercise();
    expect(screen.getByLabelText('Your HTML')).toHaveValue(STARTER);
  });

  describe('validation', () => {
    test('reports each unmet requirement separately', () => {
      renderExercise();
      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));

      expect(screen.getByText(/0 of 3 requirements met/)).toBeInTheDocument();
      expect(screen.getByText(/DOCTYPE/)).toBeInTheDocument();
      expect(screen.getByText(/declares a language/)).toBeInTheDocument();
    });

    test('shows partial progress rather than a single pass or fail', () => {
      renderExercise();
      type('<!DOCTYPE html><html><body><h2>Still wrong</h2></body></html>');
      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));

      expect(screen.getByText(/1 of 3 requirements met/)).toBeInTheDocument();
    });

    test('completes the step when every requirement is met', async () => {
      const props = renderExercise();
      type(SOLUTION);
      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));

      expect(screen.getByText('Every requirement is met.')).toBeInTheDocument();
      await waitFor(() => expect(props.onCorrect).toHaveBeenCalled());
    });

    test('does not complete the step before the student checks', () => {
      const props = renderExercise();
      type(SOLUTION);
      expect(props.onCorrect).not.toHaveBeenCalled();
    });

    test('clears the result when the student edits again', () => {
      renderExercise();
      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      expect(screen.getByText(/0 of 3 requirements met/)).toBeInTheDocument();

      type('<!DOCTYPE html>');
      expect(screen.queryByText(/requirements met/)).not.toBeInTheDocument();
    });
  });

  describe('the sandboxed preview', () => {
    test('renders in an iframe with no permissions granted', () => {
      const { container } = render(
        <HtmlExercise
          storageKey="preview-test"
          title="Preview"
          brief={<p>Write.</p>}
          starter="<html><body><p>Hello</p></body></html>"
          checks={[hasDoctype()]}
          solution={SOLUTION}
          solutionExplanation={<p>Why.</p>}
          onCorrect={vi.fn()}
        />,
      );

      const frame = container.querySelector('iframe');
      expect(frame).not.toBeNull();
      expect(frame).toHaveAttribute('sandbox', '');
      expect(frame).toHaveAttribute('title', 'Preview of your page');
    });

    test('strips script and network requests from what it displays', () => {
      const { container } = render(
        <HtmlExercise
          storageKey="preview-unsafe"
          title="Preview"
          brief={<p>Write.</p>}
          starter={'<html><head><link rel="stylesheet" href="data:text/css,body%7B%7D"></head><body><p>Hi</p><script>alert(1)</script></body></html>'}
          checks={[hasDoctype()]}
          solution={SOLUTION}
          solutionExplanation={<p>Why.</p>}
          onCorrect={vi.fn()}
        />,
      );

      const srcDoc = container.querySelector('iframe')?.getAttribute('srcdoc') ?? '';
      expect(srcDoc).not.toContain('alert(1)');
      expect(srcDoc).not.toContain('data:text/css');
      expect(srcDoc).not.toContain('<link');
      expect(srcDoc).toContain('Content-Security-Policy');
      expect(srcDoc).toContain('<p>Hi</p>');
    });

    test('a fragment exercise shows no preview', () => {
      const { container } = render(
        <HtmlExercise
          storageKey="fragment-test"
          title="Fragment"
          brief={<p>Write.</p>}
          starter="<form></form>"
          checks={[hasDoctype()]}
          solution={SOLUTION}
          solutionExplanation={<p>Why.</p>}
          showPreview={false}
          onCorrect={vi.fn()}
        />,
      );
      expect(container.querySelector('iframe')).toBeNull();
    });
  });

  describe('persistence and reset', () => {
    test('keeps the student work across a reload', () => {
      const { unmount } = render(
        <HtmlExercise
          storageKey="persist-test"
          title="Fix it"
          brief={<p>Write.</p>}
          starter={STARTER}
          checks={[hasDoctype()]}
          solution={SOLUTION}
          solutionExplanation={<p>Why.</p>}
          onCorrect={vi.fn()}
        />,
      );
      type('<!DOCTYPE html><html><body><p>In progress</p></body></html>');
      unmount();

      render(
        <HtmlExercise
          storageKey="persist-test"
          title="Fix it"
          brief={<p>Write.</p>}
          starter={STARTER}
          checks={[hasDoctype()]}
          solution={SOLUTION}
          solutionExplanation={<p>Why.</p>}
          onCorrect={vi.fn()}
        />,
      );
      expect(screen.getByLabelText('Your HTML')).toHaveValue('<!DOCTYPE html><html><body><p>In progress</p></body></html>');
    });

    test('restores the checked results after a reload', () => {
      const { unmount } = renderExercise();
      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      unmount();

      renderExercise();
      expect(screen.getByText(/0 of 3 requirements met/)).toBeInTheDocument();
    });

    test('reset returns the starter and clears the results', () => {
      renderExercise();
      type('<p>my own attempt</p>');
      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      fireEvent.click(screen.getByRole('button', { name: /Start this exercise again/ }));

      expect(screen.getByLabelText('Your HTML')).toHaveValue(STARTER);
      expect(screen.queryByText(/requirements met/)).not.toBeInTheDocument();
      expect(localStorage.getItem(courseStorageKey('html-exercise', 'exercise-test'))).toBeNull();
    });

    test('ignores a corrupted stored entry', () => {
      localStorage.setItem(courseStorageKey('html-exercise', 'exercise-test'), '"not an object"');
      renderExercise();
      expect(screen.getByLabelText('Your HTML')).toHaveValue(STARTER);
    });
  });

  describe('getting unstuck', () => {
    test('offers the solution only after three failed checks', () => {
      renderExercise({ onAssisted: vi.fn() });

      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      expect(screen.queryByRole('button', { name: /Show solution and continue/ })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      expect(screen.getByRole('button', { name: /Show solution and continue/ })).toBeInTheDocument();
    });

    test('offers the hint before the full solution', () => {
      renderExercise({ onAssisted: vi.fn(), hint: 'Start with the very first line.' });
      for (let attempt = 0; attempt < 3; attempt += 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      }
      expect(screen.getByText('Start with the very first line.')).toBeInTheDocument();
    });

    test('keeps the student work and shows the solution separately from the reasoning', () => {
      renderExercise({ onAssisted: vi.fn() });
      type('<p>my own attempt</p>');
      for (let attempt = 0; attempt < 3; attempt += 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      }
      fireEvent.click(screen.getByRole('button', { name: /Show solution and continue/ }));

      expect(screen.getByLabelText('Your HTML')).toHaveValue('<p>my own attempt</p>');
      expect(screen.getByRole('heading', { name: /Solution/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Why this is the answer' })).toBeInTheDocument();
      expect(screen.getByText(/The doctype and language belong at the top/)).toBeInTheDocument();
    });

    test('records assisted completion when the student continues', () => {
      const onAssisted = vi.fn();
      renderExercise({ onAssisted });
      for (let attempt = 0; attempt < 3; attempt += 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      }
      fireEvent.click(screen.getByRole('button', { name: /Show solution and continue/ }));
      fireEvent.click(screen.getByTestId('assisted-continue'));

      expect(onAssisted).toHaveBeenCalledTimes(1);
    });

    test('never offers help once the exercise is right', () => {
      renderExercise({ onAssisted: vi.fn() });
      for (let attempt = 0; attempt < 3; attempt += 1) {
        fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));
      }
      type(SOLUTION);
      fireEvent.click(screen.getByRole('button', { name: 'Check my HTML' }));

      expect(screen.queryByRole('button', { name: /Show solution and continue/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Solution/ })).not.toBeInTheDocument();
    });
  });
});
