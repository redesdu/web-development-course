import { useId, type ReactNode } from 'react';
import { MINIMUM_ANSWER_WORDS, countWords, wordCountLabel } from '@/lib/wordCount';

interface WrittenAnswerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Shown before the student writes, so the expectation is visible in advance. */
  instruction?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  minimumWords?: number;
  /** Rendered under the counter, for example a submit button. */
  children?: ReactNode;
}

/**
 * A written answer field with a visible word requirement.
 *
 * The instruction appears before the field, the counter updates while writing,
 * and an assistive-technology message explains what is still missing. Answers
 * saved before this requirement existed are never rejected on load: the field
 * shows whatever was saved and only the submit control reads the minimum.
 */
export function WrittenAnswer({
  label,
  value,
  onChange,
  instruction,
  placeholder,
  disabled = false,
  rows = 6,
  minimumWords = MINIMUM_ANSWER_WORDS,
  children,
}: WrittenAnswerProps) {
  const fieldId = useId();
  const words = countWords(value);
  const met = words >= minimumWords;
  const remaining = Math.max(0, minimumWords - words);

  return (
    <div className="written-answer">
      <p className="written-answer-instruction" id={`${fieldId}-instruction`}>
        {instruction ?? `Write at least ${minimumWords} words so your reasoning is visible, not just your conclusion.`}
      </p>
      <label htmlFor={fieldId}>{label}</label>
      <textarea
        id={fieldId}
        rows={rows}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-describedby={`${fieldId}-instruction ${fieldId}-count`}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="written-answer-meter">
        <span
          className={`written-answer-count ${met ? 'is-met' : 'is-short'}`}
          data-testid="written-answer-count"
        >
          {wordCountLabel(value, minimumWords)}
        </span>
        <span id={`${fieldId}-count`} role="status" className="visually-hidden">
          {met
            ? `Word requirement met: ${words} of ${minimumWords} words.`
            : `${remaining} more word${remaining === 1 ? '' : 's'} needed. You have written ${words} of ${minimumWords} words.`}
        </span>
      </div>
      {children}
    </div>
  );
}
