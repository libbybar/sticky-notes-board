import { render } from '@testing-library/react';
import { renderFormattedText, buildFormattedTextMap } from './richText';

describe('renderFormattedText', () => {
  test('wraps *text* in <strong> and strips the markers', () => {
    const { container } = render(<div>{renderFormattedText('say *hello* now')}</div>);

    expect(container.querySelector('strong')).toHaveTextContent('hello');
    expect(container.textContent).toBe('say hello now');
  });

  test('wraps _text_ in <em> and strips the markers', () => {
    const { container } = render(<div>{renderFormattedText('say _hello_ now')}</div>);

    expect(container.querySelector('em')).toHaveTextContent('hello');
    expect(container.textContent).toBe('say hello now');
  });

  test('leaves a lone, unpaired marker as literal text', () => {
    const { container } = render(<div>{renderFormattedText('a lone * mark with no pair')}</div>);

    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).toBe('a lone * mark with no pair');
  });

  test('does not treat digits around a bare asterisk as bold when spaced out (e.g. multiplication)', () => {
    const { container } = render(<div>{renderFormattedText('5 * 3 = 15')}</div>);

    expect(container.querySelector('strong')).toBeNull();
  });

  test('does not treat a marker followed by a space as an opening marker', () => {
    const { container } = render(<div>{renderFormattedText('a * space after does not count *')}</div>);

    expect(container.querySelector('strong')).toBeNull();
  });

  test('handles several markers in the same text', () => {
    const { container } = render(<div>{renderFormattedText('*one* and _two_ and *three*')}</div>);

    expect(container.querySelectorAll('strong')).toHaveLength(2);
    expect(container.querySelectorAll('em')).toHaveLength(1);
  });

  test('preserves line breaks between markers', () => {
    const { container } = render(<div>{renderFormattedText('*bold*\nplain line')}</div>);

    expect(container.textContent).toBe('bold\nplain line');
  });

  test('combines bold and italic when one marker is nested inside the other', () => {
    const { container } = render(<div>{renderFormattedText('a *_bold and italic_* word')}</div>);

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong.querySelector('em')).toHaveTextContent('bold and italic');
    expect(container.textContent).toBe('a bold and italic word');
  });
});

describe('buildFormattedTextMap', () => {
  test('strips the markers from the formatted text, same as renderFormattedText', () => {
    const { formatted } = buildFormattedTextMap('say *hi* now');

    expect(formatted).toBe('say hi now');
  });

  test('maps a formatted-text offset to the matching raw offset around a marker', () => {
    const { rawOffsets } = buildFormattedTextMap('say *hi* now');

    // formatted "say hi now": offset 6 is right after "hi" (before the space before "now").
    // raw "say *hi* now": that same logical spot is offset 7 (right after "hi", before the closing *).
    expect(rawOffsets[6]).toBe(7);
  });

  test('maps 1:1 when there is no formatting at all', () => {
    const { formatted, rawOffsets } = buildFormattedTextMap('plain text');

    expect(formatted).toBe('plain text');
    expect(rawOffsets).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
