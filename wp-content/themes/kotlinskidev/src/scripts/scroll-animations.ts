// src/scripts/scroll-animations.ts
// Use Intersection Observer for better performance
(function() {
    const selectors = [
        '.fade-in-on-scroll',
        '.fade-up-on-scroll',
        '.fade-left-on-scroll',
        '.fade-right-on-scroll'
    ];
    const elements = document.querySelectorAll<HTMLElement>(selectors.join(','));
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        elements.forEach((el: HTMLElement) => observer.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver
        const onScroll = () => {
            const windowHeight = window.innerHeight;
            elements.forEach((el: HTMLElement) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < windowHeight - 50) {
                    el.classList.add('visible');
                }
            });
        };
        document.addEventListener('DOMContentLoaded', onScroll);
        (window as Window).addEventListener('scroll', onScroll);
        (window as Window).addEventListener('resize', onScroll);
    }
})();
