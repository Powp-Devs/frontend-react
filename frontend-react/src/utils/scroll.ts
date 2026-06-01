export function smoothScrollTo(target: HTMLElement, headerOffset = 80) {
  const elementPosition = target.offsetTop;
  const offsetPosition = elementPosition - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}

export function getCurrentSectionId(pageYOffset: number, sections: HTMLElement[]): string {
  let current = '';

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;

    if (pageYOffset >= sectionTop - 100) {
      current = section.id;
    }
  });

  return current;
}

export function updateNavLinkActiveState(currentId: string, navLinks: HTMLElement[]) {
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === `#${currentId}`;
    link.classList.toggle('active', isActive);
  });
}
