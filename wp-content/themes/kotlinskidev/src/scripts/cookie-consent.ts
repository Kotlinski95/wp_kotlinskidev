/**
 * Replace Complianz consent button with cookie icon
 */

// Declare the global WordPress localized variables
declare global {
  interface Window {
    kotlinskiTheme: {
      themeUrl: string;
      assetsUrl: string;
      imagesUrl: string;
    };
  }
}

function replaceCookieConsentButton(): void {
  try {
    const consentButton = document.querySelector('.cmplz-btn.cmplz-manage-consent') as HTMLButtonElement;
    
    if (consentButton && !consentButton.dataset.cookieModified) {
      // Mark as modified to prevent duplicate processing
      consentButton.dataset.cookieModified = 'true';
      
      // Store original text content
      const originalText = consentButton.textContent || consentButton.innerText || '';
      
      // Get cookie image path using WordPress localized variables
      const cookieImagePath = window.kotlinskiTheme?.imagesUrl 
        ? `${window.kotlinskiTheme.imagesUrl}/cookie.svg`
        : '/wp-content/themes/active/assets/images/cookie.svg'; // Fallback
      
      // Replace text content with cookie image
      consentButton.innerHTML = `
        <img src="${cookieImagePath}" 
             alt="Cookie consent" 
             width="40" 
             height="40" 
             style="display: block; max-width: 100%; height: auto;"
             aria-hidden="true" />
      `;
      
      // Apply minimal styling changes - only what's necessary for the cookie look
      const originalStyle = consentButton.getAttribute('style') || '';
      consentButton.style.cssText = originalStyle + `
        border-radius: 50% !important;
        padding: 0px !important;
        min-width: auto !important;
        width: auto !important;
        height: auto !important;
        aspect-ratio: 1 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      `;
      
      // Keep original aria-label or set a descriptive one
      if (!consentButton.getAttribute('aria-label')) {
        consentButton.setAttribute('aria-label', originalText || 'Manage Cookie Consent');
      }
      
      // Add title attribute for tooltip showing original text
      consentButton.setAttribute('title', originalText || 'Manage Cookie Consent');
      
      // Store reference for potential cleanup
      (window as any).cookieConsentIcon = consentButton;
    }
  } catch (error) {
    console.warn('Failed to replace cookie consent button:', error);
  }
}

// Function to observe DOM changes for dynamically loaded Complianz button
function observeConsentButton(): void {
  try {
    // Ensure document.body exists before setting up observer
    const targetNode = document.body || document.documentElement;
    
    if (!targetNode) {
      // If neither body nor documentElement is available, try again later
      setTimeout(observeConsentButton, 100);
      return;
    }

    try {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                // Check if the added node or its descendants contain the consent button
                const consentButton = element.matches?.('.cmplz-btn.cmplz-manage-consent') 
                  ? element 
                  : element.querySelector?.('.cmplz-btn.cmplz-manage-consent');
                
                if (consentButton && !document.querySelector('.cookie-consent-icon')) {
                  // Small delay to ensure button is fully initialized
                  setTimeout(replaceCookieConsentButton, 100);
                }
              }
            });
          }
        });
      });
      
      observer.observe(targetNode, {
        childList: true,
        subtree: true
      });
      
      // Store observer reference for cleanup
      (window as any).consentObserver = observer;
    } catch (error) {
      console.warn('Cookie consent observer setup failed:', error);
      // Fallback: just try periodic checks
      const fallbackInterval = setInterval(() => {
        if (document.querySelector('.cmplz-btn.cmplz-manage-consent') && !document.querySelector('.cookie-consent-icon')) {
          replaceCookieConsentButton();
          clearInterval(fallbackInterval);
        }
      }, 500);
      
      // Clear interval after 10 seconds to avoid infinite checking
      setTimeout(() => clearInterval(fallbackInterval), 10000);
    }
  } catch (error) {
    console.warn('Failed to initialize cookie consent observer:', error);
  }
}

// Initialize the replacement
function initCookieConsentReplacement(): void {
  try {
    // Try immediate replacement
    replaceCookieConsentButton();
    
    // Set up observer for dynamic content
    observeConsentButton();
    
    // Also try on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        try {
          setTimeout(replaceCookieConsentButton, 500);
        } catch (error) {
          console.warn('Failed to replace cookie consent button on DOM ready:', error);
        }
      });
    } else {
      setTimeout(replaceCookieConsentButton, 500);
    }
  } catch (error) {
    console.warn('Failed to initialize cookie consent replacement:', error);
  }
}

// Auto-initialize when script loads
try {
  initCookieConsentReplacement();
} catch (error) {
  console.warn('Failed to auto-initialize cookie consent script:', error);
}

export { replaceCookieConsentButton, initCookieConsentReplacement };
