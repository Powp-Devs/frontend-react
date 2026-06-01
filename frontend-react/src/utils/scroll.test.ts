import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { smoothScrollTo, getCurrentSectionId, updateNavLinkActiveState } from './scroll';

describe('scroll utils', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call window.scrollTo with smooth behavior and adjusted offset', () => {
    const target = document.createElement('div');
    Object.defineProperty(target, 'offsetTop', { value: 450, configurable: true });

    smoothScrollTo(target, 90);

    expect(globalThis.scrollTo).toHaveBeenCalledWith({
      top: 360,
      behavior: 'smooth',
    });
  });

  it('should return the current section id based on pageYOffset', () => {
    const sectionA = document.createElement('section');
    sectionA.id = 'section-a';
    Object.defineProperty(sectionA, 'offsetTop', { value: 100, configurable: true });

    const sectionB = document.createElement('section');
    sectionB.id = 'section-b';
    Object.defineProperty(sectionB, 'offsetTop', { value: 300, configurable: true });

    const currentId = getCurrentSectionId(250, [sectionA, sectionB]);

    expect(currentId).toBe('section-a');
  });

  it('should toggle active class only on the matching nav link', () => {
    const linkA = document.createElement('a');
    linkA.setAttribute('href', '#section-a');
    const linkB = document.createElement('a');
    linkB.setAttribute('href', '#section-b');

    updateNavLinkActiveState('section-b', [linkA, linkB]);

    expect(linkA.classList.contains('active')).toBe(false);
    expect(linkB.classList.contains('active')).toBe(true);
  });
});
