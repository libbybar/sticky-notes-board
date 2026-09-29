// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom doesn't implement Range.getBoundingClientRect/getClientRects at all (both throw
// "is not a function"), unlike every real browser. Code that needs a selection's on-screen
// position (e.g. positioning a floating toolbar) defends against that at runtime, but the
// only way to exercise that code's real behavior in tests - rather than just its fallback -
// is to give jsdom a working, if fake, implementation.
if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = function () {
    return { top: 100, left: 100, right: 150, bottom: 120, width: 50, height: 20 };
  };
}
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = function () {
    return [this.getBoundingClientRect()];
  };
}
