import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

// *text* and _text_ mark bold/italic, WhatsApp-style. A marker can't be empty or start with
// whitespace, so a lone "*" or "5 * 3 = 15" are left as plain text - but this is still a
// simple, no-escape syntax: "2*3*4" does read as bold "3", and "my_file_name" does read as
// italic "file", the same false positives WhatsApp itself has. There's currently no way to
// type a literal marker pair as plain content (no backslash-escape or similar). Nesting the
// other marker inside a match (e.g. *_text_*) combines bold and italic - see the recursive
// helpers below.
const FORMAT_PATTERN = /\*([^\s*][^*]*?)\*|_([^\s_][^_]*?)_/g;

// Renders raw text with *bold*/_italic_ markers turned into <strong>/<em>, markers removed.
// Recurses into each match's content so the other marker can nest inside it (bold+italic
// together). Used only while a field is not being edited; while editing, the raw markers
// are shown instead, so what's on screen always matches what's actually typed.
export const renderFormattedText = (text) => {
    const pattern = new RegExp(FORMAT_PATTERN);
    const nodes = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }
        const isBold = match[1] !== undefined;
        const content = isBold ? match[1] : match[2];
        nodes.push(isBold
            ? React.createElement('strong', { key: key++ }, renderFormattedText(content))
            : React.createElement('em', { key: key++ }, renderFormattedText(content)));
        lastIndex = pattern.lastIndex;
    }
    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }
    return nodes;
};

// Maps every position in the formatted (marker-stripped) text to the matching raw offset,
// so a caret placed while reading the formatted view can be restored correctly once the
// raw markers reappear in edit mode. rawOffsets[k] is the raw index for formatted position k.
// Recurses the same way renderFormattedText does, so the two stay in sync for nested markers.
export const buildFormattedTextMap = (raw) => {
    let formatted = '';
    const rawOffsets = [0];

    const appendLiteral = (str, rawStart) => {
        for (let i = 0; i < str.length; i++) {
            formatted += str[i];
            rawOffsets.push(rawStart + i + 1);
        }
    };

    const appendFormatted = (str, rawStart) => {
        const pattern = new RegExp(FORMAT_PATTERN);
        let cursor = 0;
        let match;
        while ((match = pattern.exec(str)) !== null) {
            appendLiteral(str.slice(cursor, match.index), rawStart + cursor);
            const content = match[1] !== undefined ? match[1] : match[2];
            appendFormatted(content, rawStart + match.index + 1);
            cursor = match.index + match[0].length;
        }
        appendLiteral(str.slice(cursor), rawStart + cursor);
    };

    appendFormatted(raw, 0);
    return { formatted, rawOffsets };
};

// Finds the (text node, offset) pair that a plain-character offset within el corresponds
// to, walking every text node el contains. Shared by both caret placement (single point)
// and selection placement (a start/end pair).
const findNodeAndOffset = (el, targetOffset) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let remaining = targetOffset;
    let node = walker.nextNode();
    let lastNode = null;
    while (node) {
        lastNode = node;
        const len = node.textContent.length;
        if (remaining <= len) {
            return { node, offset: remaining };
        }
        remaining -= len;
        node = walker.nextNode();
    }
    if (lastNode) return { node: lastNode, offset: lastNode.textContent.length };
    return { node: el, offset: 0 };
};

// The plain-character offset within el of a given (node, offset) boundary point - the
// inverse of findNodeAndOffset.
const getOffsetWithinElement = (el, node, offset) => {
    const preRange = document.createRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(node, offset);
    return preRange.toString().length;
};

// Reads the caret's plain-character offset within el (null if the selection isn't inside it).
export const getCaretOffset = (el) => {
    try {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        const range = selection.getRangeAt(0);
        if (!el.contains(range.startContainer)) return null;
        return getOffsetWithinElement(el, range.startContainer, range.startOffset);
    } catch (e) {
        return null;
    }
};

// Places the caret at a plain-character offset within el. Best-effort: silently does
// nothing if the Selection API isn't available.
export const setCaretOffset = (el, offset) => {
    try {
        const { node, offset: nodeOffset } = findNodeAndOffset(el, offset);
        const range = document.createRange();
        range.setStart(node, nodeOffset);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    } catch (e) {
        // best effort only
    }
};

// Moving the caret via the Selection API (as setCaretOffset does) is a silent, programmatic
// change - unlike a real keypress, the browser doesn't scroll anything to keep it visible.
// So after inserting a line break this way, fast-growing content (e.g. many short lines) can
// push the caret below the field's scrollable area while typing continues unseen. This finds
// the nearest scrolling ancestor and nudges its scrollTop so the caret rect stays inside it.
const scrollCaretIntoView = (el) => {
    try {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(true);
        const caretRect = range.getClientRects()[0];
        if (!caretRect) return;

        let container = el.parentElement;
        while (container && container !== document.body) {
            const style = window.getComputedStyle(container);
            if (/(auto|scroll)/.test(style.overflowY) && container.scrollHeight > container.clientHeight) {
                break;
            }
            container = container.parentElement;
        }
        if (!container || container === document.body) return;

        const containerRect = container.getBoundingClientRect();
        if (caretRect.bottom > containerRect.bottom) {
            container.scrollTop += caretRect.bottom - containerRect.bottom;
        } else if (caretRect.top < containerRect.top) {
            container.scrollTop -= containerRect.top - caretRect.top;
        }
    } catch (e) {
        // best effort only
    }
};

// Inserts str at the caret as plain text (replacing el.textContent, same as wrapSelectionWith
// below) rather than letting the browser handle the key itself - contentEditable's own
// handling of Enter inserts a <br>/<div>, which textContent silently drops on save, so a line
// break typed that way would disappear the moment the field blurs. A literal "\n" text-node
// character survives that round trip, matching the white-space: pre-wrap CSS these fields use.
export const insertTextAtCaret = (el, str) => {
    try {
        const offset = getCaretOffset(el);
        if (offset === null) return;
        const fullText = el.textContent;
        el.textContent = fullText.slice(0, offset) + str + fullText.slice(offset);
        setCaretOffset(el, offset + str.length);
        scrollCaretIntoView(el);
    } catch (e) {
        // best effort only
    }
};

// Selects the plain-character range [start, end) within el.
const setSelectionOffsets = (el, start, end) => {
    try {
        const startPos = findNodeAndOffset(el, start);
        const endPos = findNodeAndOffset(el, end);
        const range = document.createRange();
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    } catch (e) {
        // best effort only
    }
};

// Tracks whether a *bold*/_italic_ field is being edited (raw markers shown) or just
// displayed (formatted, markers hidden), and keeps the caret in the same logical spot
// across that switch - otherwise clicking back into formatted text to edit it can land
// the caret in the wrong place, since the raw text is a different length (it has markers).
export const useFormattedField = (rawText, elRef) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectionRect, setSelectionRect] = useState(null);
    const pendingCaretRef = useRef(null);

    useLayoutEffect(() => {
        if (!isEditing || pendingCaretRef.current === null || !elRef.current) return;
        const { rawOffsets } = buildFormattedTextMap(rawText);
        const formattedOffset = Math.min(pendingCaretRef.current, rawOffsets.length - 1);
        const rawOffset = rawOffsets[formattedOffset] ?? rawText.length;
        setCaretOffset(elRef.current, rawOffset);
        pendingCaretRef.current = null;
        // rawText is intentionally omitted: it only matters at the instant edit mode starts,
        // and including it would re-run this (and fight the user's typing) on every keystroke.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    const handleFocus = () => {
        pendingCaretRef.current = getCaretOffset(elRef.current);
        setIsEditing(true);
    };
    const handleBlur = () => setIsEditing(false);

    // Shows the formatting toolbar only for a real, non-empty selection made while editing
    // the raw text - selecting already-formatted (read-only) text isn't supported.
    // React's onSelect prop isn't reliably wired for contentEditable elements, so this
    // listens to the document-level selectionchange event directly, only while editing.
    useEffect(() => {
        if (!isEditing) {
            setSelectionRect(null);
            return;
        }
        const handleSelectionChange = () => {
            try {
                const selection = window.getSelection();
                const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                if (!range || selection.isCollapsed || !elRef.current || !elRef.current.contains(range.commonAncestorContainer)) {
                    setSelectionRect(null);
                    return;
                }
                // getBoundingClientRect covers the whole (possibly multi-line) selection and
                // is preferred; getClientRects is the fallback for environments missing it.
                let rect = null;
                try {
                    rect = range.getBoundingClientRect();
                } catch (e) {
                    rect = null;
                }
                if (!rect) {
                    try {
                        const rects = range.getClientRects();
                        rect = rects && rects[0] ? rects[0] : null;
                    } catch (e) {
                        rect = null;
                    }
                }
                setSelectionRect(rect);
            } catch (e) {
                setSelectionRect(null);
            }
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    // Toggles the given marker (e.g. "*" for bold) around the current selection: wraps it
    // if it isn't already wrapped, unwraps it if the selection touches an existing span of
    // this marker type - so pressing the button twice is a no-op, and bold+italic can be
    // combined by nesting one marker inside the other. The unwrap check looks for any
    // existing span the selection overlaps at all, rather than requiring the selection's own
    // edges to land exactly on the markers: real mouse/touch selection is rarely that precise,
    // and requiring exact alignment meant clicking the same button twice sometimes wrapped
    // again instead of unwrapping, depending on exactly what got selected.
    // Works on el's plain text as a string rather than the DOM Range directly: repeated
    // Range.insertNode calls fragment text nodes in ways that get fragile to reason about,
    // while a single textContent replacement plus a restored selection stays simple and
    // correct however many times it's applied.
    const wrapSelectionWith = (marker) => {
        try {
            const el = elRef.current;
            if (!el) return;
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
            const range = selection.getRangeAt(0);
            if (!el.contains(range.commonAncestorContainer)) return;

            const fullText = el.textContent;
            const start = getOffsetWithinElement(el, range.startContainer, range.startOffset);
            const end = getOffsetWithinElement(el, range.endContainer, range.endOffset);
            if (start === end) return;

            const isBoldMarker = marker === '*';
            const pattern = new RegExp(FORMAT_PATTERN);
            let existingSpan = null;
            let match;
            while ((match = pattern.exec(fullText)) !== null) {
                if ((match[1] !== undefined) === isBoldMarker) {
                    const spanStart = match.index;
                    const spanEnd = match.index + match[0].length;
                    if (start < spanEnd && end > spanStart) {
                        existingSpan = { start: spanStart, end: spanEnd, content: match[1] !== undefined ? match[1] : match[2] };
                        break;
                    }
                }
            }

            let newText;
            let newStart;
            let newEnd;
            if (existingSpan) {
                newText = fullText.slice(0, existingSpan.start) + existingSpan.content + fullText.slice(existingSpan.end);
                newStart = existingSpan.start;
                newEnd = existingSpan.start + existingSpan.content.length;
            } else {
                const selected = fullText.slice(start, end);
                newText = fullText.slice(0, start) + marker + selected + marker + fullText.slice(end);
                newStart = start;
                newEnd = start + marker.length + selected.length + marker.length;
            }

            el.textContent = newText;
            setSelectionOffsets(el, newStart, newEnd);
        } catch (e) {
            // best effort only
        } finally {
            setSelectionRect(null);
        }
    };

    return {
        isEditing,
        handleFocus,
        handleBlur,
        selectionRect,
        applyBold: () => wrapSelectionWith('*'),
        applyItalic: () => wrapSelectionWith('_')
    };
};

// Ctrl/Cmd+B and Ctrl/Cmd+I toggle bold/italic on the current selection without needing the
// floating toolbar at all - the toolbar is portaled to document.body (see StickyNote.jsx) so
// it sits outside the field's own tab order, so a keyboard shortcut is the real accessible
// path here, the same as in any other rich text editor. Returns true if it handled the key.
export const handleFormatShortcut = (e, formatting) => {
    if (!(e.ctrlKey || e.metaKey)) return false;
    const key = e.key.toLowerCase();
    if (key === 'b') {
        e.preventDefault();
        formatting.applyBold();
        return true;
    }
    if (key === 'i') {
        e.preventDefault();
        formatting.applyItalic();
        return true;
    }
    return false;
};
