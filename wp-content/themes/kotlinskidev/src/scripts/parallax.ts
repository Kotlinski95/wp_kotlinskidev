// src/scripts/parallax.ts
interface ParallaxElement extends HTMLElement {
  dataset: DOMStringMap & {
    parallaxSpeed?: string;
    parallaxEnabled?: string;
  };
}

class ParallaxController {
  private elements: ParallaxElement[] = [];
  private isScrolling = false;
  private ticking = false;

  constructor() {
    this.init();
  }

  private init(): void {
    console.log('🔍 Parallax Debug: Starting initialization...');
    
    // Find all cover blocks with parallax enabled
    this.elements = Array.from(
      document.querySelectorAll<ParallaxElement>('.wp-block-cover.enable-parallax')
    );

    console.log('🔍 Parallax Debug: Found elements:', this.elements.length);
    console.log('🔍 Parallax Debug: Elements:', this.elements);

    // Also check for elements that might have the attribute but not the class
    const allCovers = document.querySelectorAll('.wp-block-cover');
    console.log('🔍 Parallax Debug: Total cover blocks found:', allCovers.length);
    
    allCovers.forEach((cover, index) => {
      const hasClass = cover.classList.contains('enable-parallax');
      const hasAttribute = cover.hasAttribute('data-parallax-speed');
      console.log(`🔍 Parallax Debug: Cover ${index}:`, {
        element: cover,
        hasEnableParallaxClass: hasClass,
        hasSpeedAttribute: hasAttribute,
        classes: Array.from(cover.classList),
        attributes: cover.getAttributeNames().map(name => `${name}="${cover.getAttribute(name)}"`),
      });
    });

    if (this.elements.length === 0) {
      console.warn('⚠️ Parallax Debug: No parallax elements found! Exiting...');
      return;
    }

    console.log('✅ Parallax Debug: Proceeding with setup...');

    // Set initial styles and setup parallax
    this.setupParallaxElements();

    // Bind scroll event with throttling
    this.bindEvents();

    // Initial position calculation
    this.updateParallax();
    
    console.log('✅ Parallax Debug: Initialization complete!');
  }

  private setupParallaxElements(): void {
    console.log('🔧 Parallax Debug: Setting up parallax elements...');
    
    this.elements.forEach((element, index) => {
      console.log(`🔧 Parallax Debug: Processing element ${index}:`, element);
      
      // Set parallax speed from block attribute or default
      element.dataset.parallaxSpeed = element.dataset.parallaxSpeed || '0.5';
      console.log(`🔧 Parallax Debug: Set speed to: ${element.dataset.parallaxSpeed}`);

      // Find the existing WordPress cover background image
      const existingBg = element.querySelector('.wp-block-cover__image-background') as HTMLImageElement;
      console.log('🔧 Parallax Debug: Found existing background:', existingBg);
      
      if (existingBg) {
        console.log('✅ Parallax Debug: Creating parallax structure...');
        
        // Create parallax background structure dynamically
        const bgWrapper = document.createElement('div');
        bgWrapper.className = 'parallax-bg-wrapper';
        
        const parallaxBg = existingBg.cloneNode(true) as HTMLImageElement;
        parallaxBg.className = 'parallax-bg';
        
        bgWrapper.appendChild(parallaxBg);
        
        // Insert the parallax wrapper before the existing background
        existingBg.parentNode?.insertBefore(bgWrapper, existingBg);
        
        // Hide the original background
        existingBg.style.display = 'none';
        
        console.log('✅ Parallax Debug: Created wrapper:', bgWrapper);
        console.log('✅ Parallax Debug: Created parallax bg:', parallaxBg);
        
        // Setup wrapper styles for overflow hidden
        bgWrapper.style.cssText = `
          position: absolute;
          top: -20%;
          left: 0;
          right: 0;
          bottom: -20%;
          overflow: hidden;
          z-index: 1;
          display: block;
        `;

        // Setup background image styles
        parallaxBg.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 150%;
          object-fit: cover;
          will-change: transform;
        `;
        
        console.log('✅ Parallax Debug: Applied styles to wrapper and background');
      } else {
        console.warn('⚠️ Parallax Debug: No background image found in element!');
      }

      // Ensure content is above background
      const innerContainer = element.querySelector('.wp-block-cover__inner-container') as HTMLElement;
      if (innerContainer) {
        innerContainer.style.position = 'relative';
        innerContainer.style.zIndex = '3';
        console.log('✅ Parallax Debug: Set inner container z-index');
      } else {
        console.warn('⚠️ Parallax Debug: No inner container found!');
      }

      // Ensure overlay is properly positioned
      const overlay = element.querySelector('.wp-block-cover__background') as HTMLElement;
      if (overlay) {
        overlay.style.zIndex = '2';
        console.log('✅ Parallax Debug: Set overlay z-index');
      } else {
        console.warn('⚠️ Parallax Debug: No overlay found!');
      }

      // Add parallax classes to any content elements for subtle movement
      const contentElements = element.querySelectorAll('.wp-block-heading, .wp-block-buttons, .wp-block-paragraph') as NodeListOf<HTMLElement>;
      console.log(`🔧 Parallax Debug: Found ${contentElements.length} content elements`);
      contentElements.forEach(content => {
        content.classList.add('parallax-content');
      });
      
      console.log(`✅ Parallax Debug: Completed setup for element ${index}`);
    });
    
    console.log('✅ Parallax Debug: All elements setup complete!');
  }

  private bindEvents(): void {
    const handleScroll = (): void => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          this.ticking = false;
        });
        this.ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      // Recalculate on resize
      setTimeout(() => this.updateParallax(), 100);
    });
  }

  private updateParallax(): void {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;

    console.log(`📜 Parallax Debug: Scroll update - scrollTop: ${scrollTop}, windowHeight: ${windowHeight}`);

    this.elements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      
      // Check if element is in viewport (with some buffer)
      const isInViewport = (
        rect.bottom > -windowHeight * 0.5 && 
        rect.top < windowHeight * 1.5
      );

      console.log(`📜 Parallax Debug: Element ${index} - top: ${rect.top}, bottom: ${rect.bottom}, inViewport: ${isInViewport}`);

      if (!isInViewport) {
        console.log(`📜 Parallax Debug: Element ${index} not in viewport, skipping`);
        return;
      }

      // Get parallax speed (default 0.5, can be customized via data attribute)
      const speed = parseFloat(element.dataset.parallaxSpeed || '0.5');
      
      // Calculate parallax offset
      const yPos = (scrollTop - elementTop) * speed;
      
      console.log(`📜 Parallax Debug: Element ${index} - speed: ${speed}, yPos: ${yPos}`);
      
      // Apply transform to background image
      const bg = element.querySelector('.parallax-bg') as HTMLElement;
      if (bg) {
        // Use translate3d for better performance
        bg.style.transform = `translate3d(0, ${yPos}px, 0)`;
        console.log(`✅ Parallax Debug: Applied transform to bg: translate3d(0, ${yPos}px, 0)`);
      } else {
        console.warn(`⚠️ Parallax Debug: No .parallax-bg found in element ${index}!`);
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ParallaxController();
});

// Also handle dynamic content loading
document.addEventListener('wp-blocks-loaded', () => {
  new ParallaxController();
});

export default ParallaxController;
