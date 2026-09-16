import { render, screen } from '@testing-library/react';
import { HtmlReference } from './HtmlReference';

describe('HtmlReference', () => {
  test('covers every area the lecture expects students to look up', () => {
    render(<HtmlReference />);

    for (const summary of [
      'Anatomy of an element',
      'The shape of a document',
      'Metadata in the head',
      'Text, headings, and emphasis',
      'Links and images',
      'Lists and tables',
      'Containers and the flow of the page',
      'Semantic elements',
      'Forms and labels',
      'Attributes you will use constantly',
    ]) {
      expect(screen.getByText(summary)).toBeInTheDocument();
    }
  });

  test('uses native disclosure sections so the browser handles keyboard and find', () => {
    const { container } = render(<HtmlReference />);
    const sections = container.querySelectorAll('details.html-reference-section');

    expect(sections).toHaveLength(10);
    for (const section of sections) {
      expect(section.querySelector(':scope > summary')).not.toBeNull();
    }
  });

  test('starts closed so the guide stays scannable', () => {
    const { container } = render(<HtmlReference />);
    const open = container.querySelectorAll('details[open]');
    expect(open).toHaveLength(0);
  });

  test('lets more than one section stay open at the same time', () => {
    const { container } = render(<HtmlReference />);
    const named = container.querySelectorAll('details[name]');
    expect(named).toHaveLength(0);
  });

  test('gives the rules a student most often gets wrong', () => {
    render(<HtmlReference />);

    expect(screen.getByText(/do not skip a level/)).toBeInTheDocument();
    expect(screen.getByText(/purely decorative/)).toBeInTheDocument();
    expect(screen.getByText(/must equal the/)).toBeInTheDocument();
    expect(screen.getByText(/has to be unique/)).toBeInTheDocument();
  });
});
