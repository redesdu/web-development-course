import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { SequenceOrder, type SequenceItem } from './SequenceOrder';

const items: SequenceItem[] = [
  { id: 'first', label: 'The browser sends a request', note: 'The client starts the exchange.' },
  { id: 'second', label: 'The server does the work', note: 'Shared data lives on the server.' },
  { id: 'third', label: 'The browser updates the page', note: 'The interface changes last.' },
];

function renderSequence(overrides: Partial<Parameters<typeof SequenceOrder>[0]> = {}) {
  const props = {
    storageKey: 'sequence-test',
    prompt: 'Order the exchange',
    scenario: <p>A student opens a page.</p>,
    items,
    onCorrect: vi.fn(),
    ...overrides,
  };
  render(<SequenceOrder {...props} />);
  return props;
}

function currentOrder() {
  return screen.getAllByRole('listitem').map((item) => item.querySelector('.sequence-label')?.textContent);
}

describe('SequenceOrder', () => {
  beforeEach(() => localStorage.clear());

  test('starts in an order that is not the answer', () => {
    renderSequence();
    expect(currentOrder()).not.toEqual(items.map((item) => item.label));
  });

  test('moves an item with labelled keyboard-reachable controls', () => {
    renderSequence();
    const before = currentOrder();
    fireEvent.click(screen.getByRole('button', { name: `Move "${before[1]}" earlier` }));
    expect(currentOrder()[0]).toBe(before[1]);
  });

  test('cannot move the first item earlier or the last item later', () => {
    renderSequence();
    const order = currentOrder();
    expect(screen.getByRole('button', { name: `Move "${order[0]}" earlier` })).toBeDisabled();
    expect(screen.getByRole('button', { name: `Move "${order[2]}" later` })).toBeDisabled();
  });

  test('reports an order that is not yet right without completing the step', () => {
    const props = renderSequence();
    fireEvent.click(screen.getByRole('button', { name: 'Check this order' }));
    expect(screen.getByRole('status')).toHaveTextContent('Some steps are not in position yet.');
    expect(props.onCorrect).not.toHaveBeenCalled();
  });

  function solve() {
    for (const label of items.map((item) => item.label)) {
      let guard = 0;
      while (currentOrder().indexOf(label) > items.map((i) => i.label).indexOf(label) && guard < 6) {
        fireEvent.click(screen.getByRole('button', { name: `Move "${label}" earlier` }));
        guard += 1;
      }
    }
  }

  test('completes the step once the order is correct', async () => {
    const props = renderSequence();
    solve();
    expect(currentOrder()).toEqual(items.map((item) => item.label));
    fireEvent.click(screen.getByRole('button', { name: 'Check this order' }));
    expect(screen.getByRole('status')).toHaveTextContent('That is the order.');
    await waitFor(() => expect(props.onCorrect).toHaveBeenCalled());
  });

  test('keeps the order across a reload', () => {
    renderSequence();
    const before = currentOrder();
    fireEvent.click(screen.getByRole('button', { name: `Move "${before[1]}" earlier` }));
    const moved = currentOrder();

    screen.getByRole('button', { name: 'Check this order' });
    render(<SequenceOrder storageKey="sequence-test" prompt="Order the exchange" scenario={<p>Again.</p>} items={items} onCorrect={vi.fn()} />);
    expect(currentOrder().slice(0, 3)).toEqual(moved);
  });

  test('offers the solution only after three wrong checks', () => {
    renderSequence({ onAssisted: vi.fn() });

    fireEvent.click(screen.getByRole('button', { name: 'Check this order' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check this order' }));
    expect(screen.queryByRole('button', { name: /Show solution and continue/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Check this order' }));
    expect(screen.getByRole('button', { name: /Show solution and continue/ })).toBeInTheDocument();
  });

  test('records assisted completion and shows the reasoning per step', () => {
    const onAssisted = vi.fn();
    renderSequence({ onAssisted });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Check this order' }));
    }
    fireEvent.click(screen.getByRole('button', { name: /Show solution and continue/ }));

    expect(screen.getByText('The client starts the exchange.')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('assisted-continue'));
    expect(onAssisted).toHaveBeenCalledTimes(1);
  });

  test('reset returns the starting order and the attempts', () => {
    renderSequence({ onAssisted: vi.fn() });
    const start = currentOrder();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Check this order' }));
    }
    fireEvent.click(screen.getByRole('button', { name: `Move "${start[1]}" earlier` }));
    fireEvent.click(screen.getByRole('button', { name: /Start this order again/ }));

    expect(currentOrder()).toEqual(start);
    expect(screen.queryByRole('button', { name: /Show solution and continue/ })).not.toBeInTheDocument();
  });

  test('ignores a stored order that does not match the items', () => {
    localStorage.setItem(
      courseStorageKey('sequence-order', 'sequence-test'),
      JSON.stringify({ version: 1, order: ['first', 'unknown'], submitted: false }),
    );
    renderSequence();
    expect(currentOrder()).toHaveLength(3);
    expect(currentOrder()).not.toEqual(items.map((item) => item.label));
  });
});
