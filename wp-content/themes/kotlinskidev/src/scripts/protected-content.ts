/**
 * Protected Content Frontend Handler
 * Functional programming approach for RSA-encrypted content decryption via AJAX
 */

interface ProtectionConfig {
    ajaxUrl: string;
    nonce: string;
    errorText: string;
}

// Configuration getter
const getConfig = (): ProtectionConfig => {
    return (window as any).kotlinskidevProtectionConfig || {
        ajaxUrl: '/wp-admin/admin-ajax.php',
        nonce: '',
        errorText: 'Failed to load protected content'
    };
};

// Decrypt content using server-side RSA decryption
const decryptContent = async (element: HTMLElement, encryptedContent: string, type: string): Promise<void> => {
    const config = getConfig();
    
    try {
        const formData = new FormData();
        formData.append('action', 'kotlinskidev_decrypt_content');
        formData.append('content', encryptedContent);
        formData.append('type', type);
        formData.append('nonce', config.nonce);

        const response = await fetch(config.ajaxUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            revealContent(element, result.data.content, type);
        } else {
            // Check if it's a nonce expiration issue
            if (result.data?.error_code === 'nonce_expired') {
                // Try to get a fresh nonce and retry
                await retryWithFreshNonce(element, encryptedContent, type);
            } else {
                throw new Error(result.data?.message || result.data || 'Unknown decryption error');
            }
        }
    } catch (error) {
        console.error('Failed to decrypt protected content:', error);
        showError(element, type);
    }
};

// Retry decryption with a fresh nonce
const retryWithFreshNonce = async (element: HTMLElement, encryptedContent: string, type: string): Promise<void> => {
    const config = getConfig();
    
    try {
        // Get a fresh nonce
        const nonceFormData = new FormData();
        nonceFormData.append('action', 'kotlinskidev_get_fresh_nonce');
        
        const nonceResponse = await fetch(config.ajaxUrl, {
            method: 'POST',
            body: nonceFormData
        });

        if (nonceResponse.ok) {
            const nonceResult = await nonceResponse.json();
            if (nonceResult.success) {
                // Update the global config with fresh nonce
                (window as any).kotlinskidevProtectionConfig.nonce = nonceResult.data.nonce;
                
                // Retry the original request with fresh nonce
                await decryptContent(element, encryptedContent, type);
                return;
            }
        }
        
        // If fresh nonce fetch failed, show error
        throw new Error('Failed to refresh security token');
    } catch (error) {
        console.error('Failed to get fresh nonce:', error);
        showError(element, type);
    }
};

// Reveal the decrypted content
const revealContent = (element: HTMLElement, content: string, type: string): void => {
    element.innerHTML = content;
    element.classList.remove('protection-loading');
    element.classList.add('protection-loaded');
    element.removeAttribute('data-original-content');
    element.setAttribute('aria-label', `Protected ${type} content revealed`);
};

// Show error message
const showError = (element: HTMLElement, type: string): void => {
    const config = getConfig();
    element.innerHTML = config.errorText;
    element.classList.remove('protection-loading');
    element.classList.add('protection-error');
    element.setAttribute('aria-label', `Failed to load protected ${type} content`);
};

// Show loading spinner
const showLoading = (element: HTMLElement): void => {
    const themeUrl = (window as any).kotlinskidevProtectionConfig?.themeUrl || '/wp-content/themes/kotlinskidev';
    element.innerHTML = `<img src="${themeUrl}/assets/images/loading.svg" alt="Loading..." class="protection-loading-spinner" />`;
    element.classList.add('protection-loading');
};

// Process individual protected element
const processElement = (element: HTMLElement): void => {
    const originalContent = element.getAttribute('data-original-content');
    const protectionType = element.getAttribute('data-protection-type') || 'text';

    if (!originalContent) {
        console.warn('Protected element missing original content data');
        return;
    }
    
    // Show loading spinner
    showLoading(element);

    // Add loading delay to prevent immediate bot scanning
    setTimeout(() => {
        decryptContent(element, originalContent, protectionType);
    }, Math.random() * 500 + 200); // Random delay 200-700ms
};

// Process all protected elements on the page
const processProtectedElements = (): void => {
    const protectedElements = document.querySelectorAll('[data-protected="true"]');
    protectedElements.forEach((element) => {
        processElement(element as HTMLElement);
    });
};

// Observe DOM changes for dynamic content
const observeDOM = (): void => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;
                    
                    // Check if the added element is protected
                    if (element.hasAttribute('data-protected')) {
                        processElement(element);
                    }
                    
                    // Check for protected elements within added element
                    const protectedElements = element.querySelectorAll('[data-protected="true"]');
                    protectedElements.forEach((protectedEl) => {
                        processElement(protectedEl as HTMLElement);
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
};

// Public function to manually decrypt content
const decryptText = async (encryptedText: string, type: string = 'text'): Promise<string> => {
    const config = getConfig();
    
    try {
        const formData = new FormData();
        formData.append('action', 'kotlinskidev_decrypt_content');
        formData.append('content', encryptedText);
        formData.append('type', type);
        formData.append('nonce', config.nonce);

        const response = await fetch(config.ajaxUrl, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            return result.data.raw_content;
        } else {
            // Check if it's a nonce expiration issue
            if (result.data?.error_code === 'nonce_expired') {
                // Try to get a fresh nonce and retry
                return await retryDecryptTextWithFreshNonce(encryptedText, type);
            } else {
                throw new Error(result.data?.message || result.data || 'Unknown decryption error');
            }
        }
    } catch (error) {
        console.error('Failed to decrypt text:', error);
        throw error;
    }
};

// Retry text decryption with fresh nonce
const retryDecryptTextWithFreshNonce = async (encryptedText: string, type: string): Promise<string> => {
    const config = getConfig();
    
    // Get a fresh nonce
    const nonceFormData = new FormData();
    nonceFormData.append('action', 'kotlinskidev_get_fresh_nonce');
    
    const nonceResponse = await fetch(config.ajaxUrl, {
        method: 'POST',
        body: nonceFormData
    });

    if (nonceResponse.ok) {
        const nonceResult = await nonceResponse.json();
        if (nonceResult.success) {
            // Update the global config with fresh nonce
            (window as any).kotlinskidevProtectionConfig.nonce = nonceResult.data.nonce;
            
            // Retry the original request with fresh nonce
            const retryFormData = new FormData();
            retryFormData.append('action', 'kotlinskidev_decrypt_content');
            retryFormData.append('content', encryptedText);
            retryFormData.append('type', type);
            retryFormData.append('nonce', nonceResult.data.nonce);

            const retryResponse = await fetch(config.ajaxUrl, {
                method: 'POST',
                body: retryFormData
            });

            const retryResult = await retryResponse.json();
            if (retryResult.success) {
                return retryResult.data.raw_content;
            }
        }
    }
    
    throw new Error('Failed to refresh security token and decrypt content');
};

// Initialize the protection system
const initProtection = (): void => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processProtectedElements);
    } else {
        processProtectedElements();
    }

    // Start observing for dynamic content
    observeDOM();
};

// Export functions for external use
const kotlinskidevProtection = {
    decryptText,
    processProtectedElements,
    processElement,
    initProtection
};

// Initialize protection system
initProtection();

// Export for potential external use
(window as any).kotlinskidevProtection = kotlinskidevProtection;
