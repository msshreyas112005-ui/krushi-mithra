/**
 * KRISHI MITHRA - Mobile Navigation Handler
 * 
 * This script handles the hamburger menu functionality for mobile devices.
 * It provides smooth transitions and proper state management.
 */

(function() {
    'use strict';

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', initializeMobileNav);

    function initializeMobileNav() {
        console.log('🔧 Initializing mobile navigation...');

        // Create and inject hamburger menu if it doesn't exist
        createHamburgerMenu();

        // Setup event listeners
        setupMobileMenuListeners();

        // Handle window resize
        handleWindowResize();

        console.log('✅ Mobile navigation initialized');
    }

    /**
     * Create hamburger menu button if it doesn't exist
     */
    function createHamburgerMenu() {
        // Check if hamburger already exists
        if (document.querySelector('.hamburger-menu')) {
            console.log('Hamburger menu already exists');
            return;
        }

        // Find the navbar container
        const navbarContainer = document.querySelector('.navbar-container') || 
                               document.querySelector('.header-content');

        if (!navbarContainer) {
            console.warn('⚠️ Navbar container not found');
            return;
        }

        // Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger-menu';
        hamburger.setAttribute('aria-label', 'Toggle mobile menu');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        // Insert hamburger after logo or as first child
        const logo = navbarContainer.querySelector('.logo');
        if (logo && logo.nextSibling) {
            navbarContainer.insertBefore(hamburger, logo.nextSibling);
        } else {
            navbarContainer.appendChild(hamburger);
        }

        console.log('✅ Hamburger menu created');
    }

    /**
     * Setup event listeners for mobile menu
     */
    function setupMobileMenuListeners() {
        const hamburger = document.querySelector('.hamburger-menu');
        const navLinks = document.querySelector('.nav-links') || 
                        document.querySelector('.nav-menu ul');

        if (!hamburger) {
            console.warn('⚠️ Hamburger menu not found');
            return;
        }

        if (!navLinks) {
            console.warn('⚠️ Nav links not found');
            return;
        }

        // Toggle menu on hamburger click
        hamburger.addEventListener('click', function() {
            toggleMobileMenu(hamburger, navLinks);
        });

        // Close menu when clicking nav links
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                closeMobileMenu(hamburger, navLinks);
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = hamburger.contains(event.target) || 
                                 navLinks.contains(event.target);
            
            if (!isClickInside && navLinks.classList.contains('mobile-active')) {
                closeMobileMenu(hamburger, navLinks);
            }
        });

        // Close menu on ESC key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navLinks.classList.contains('mobile-active')) {
                closeMobileMenu(hamburger, navLinks);
            }
        });
    }

    /**
     * Toggle mobile menu open/close
     */
    function toggleMobileMenu(hamburger, navLinks) {
        const isActive = navLinks.classList.contains('mobile-active');

        if (isActive) {
            closeMobileMenu(hamburger, navLinks);
        } else {
            openMobileMenu(hamburger, navLinks);
        }
    }

    /**
     * Open mobile menu
     */
    function openMobileMenu(hamburger, navLinks) {
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('mobile-active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';

        console.log('📱 Mobile menu opened');
    }

    /**
     * Close mobile menu
     */
    function closeMobileMenu(hamburger, navLinks) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('mobile-active');
        
        // Restore body scroll
        document.body.style.overflow = '';

        console.log('📱 Mobile menu closed');
    }

    /**
     * Handle window resize
     */
    function handleWindowResize() {
        let resizeTimer;
        
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            
            resizeTimer = setTimeout(function() {
                const hamburger = document.querySelector('.hamburger-menu');
                const navLinks = document.querySelector('.nav-links') || 
                                document.querySelector('.nav-menu ul');

                // Close menu if window is resized to desktop size
                if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('mobile-active')) {
                    closeMobileMenu(hamburger, navLinks);
                }
            }, 250);
        });
    }

    /**
     * Section navigation handler for farmer dashboard
     * Shows only one section at a time
     */
    function initializeSectionNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        if (navLinks.length === 0) {
            return; // Not on farmer dashboard
        }

        console.log('🔧 Initializing section navigation...');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const sectionId = this.getAttribute('data-section');
                showSection(sectionId);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Close mobile menu if open
                const hamburger = document.querySelector('.hamburger-menu');
                const navMenu = document.querySelector('.nav-menu ul');
                if (hamburger && navMenu) {
                    closeMobileMenu(hamburger, navMenu);
                }
            });
        });

        // Show first section by default
        const firstSection = navLinks[0]?.getAttribute('data-section');
        if (firstSection) {
            showSection(firstSection);
        }
    }

    /**
     * Show specific section, hide others
     */
    function showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
            
            // Scroll to top of section
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            console.log(`📄 Showing section: ${sectionId}`);
        }
    }

    // Initialize section navigation
    document.addEventListener('DOMContentLoaded', initializeSectionNavigation);

    // Make functions available globally for debugging
    window.krishimithra = window.krishimithra || {};
    window.krishimithra.mobile = {
        openMenu: function() {
            const hamburger = document.querySelector('.hamburger-menu');
            const navLinks = document.querySelector('.nav-links') || 
                            document.querySelector('.nav-menu ul');
            if (hamburger && navLinks) openMobileMenu(hamburger, navLinks);
        },
        closeMenu: function() {
            const hamburger = document.querySelector('.hamburger-menu');
            const navLinks = document.querySelector('.nav-links') || 
                            document.querySelector('.nav-menu ul');
            if (hamburger && navLinks) closeMobileMenu(hamburger, navLinks);
        },
        showSection: showSection
    };

})();
