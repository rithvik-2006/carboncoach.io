import '@testing-library/jest-dom'

// Mock scrollIntoView since jsdom doesn't support it
window.HTMLElement.prototype.scrollIntoView = jest.fn()
window.HTMLElement.prototype.scrollTo = jest.fn()
if (typeof window.Element !== 'undefined') {
  window.Element.prototype.scrollTo = jest.fn()
}

// Mock ResizeObserver since jsdom doesn't support it
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

