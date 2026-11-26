<?php
function kotlinskidev_print_maintenance_widget_styles()
{
?>
            .maintenance-language-switcher {
                position: fixed;
                top: 1.25rem;
                left: 1.25rem;
                z-index: 1000;
            }

            .language-dropdown {
                position: relative;
                display: inline-block;
            }

            .language-current {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(0, 0, 0, 0.7);
                color: #ebebeb;
                border: 0.0625rem solid #dad1b3;
                border-radius: 0.375rem;
                padding: 0.5rem 0.75rem;
                cursor: pointer;
                font-size: 0.875rem;
                font-family: 'Hind', sans-serif;
                transition: all 0.3s ease;
            }

            .language-current:hover {
                background: rgba(0, 0, 0, 0.9);
                border-color: #c9bc91;
            }

            .flag-icon {
                width: 1rem;
                height: 0.75rem;
                object-fit: cover;
                border-radius: 0.125rem;
            }

            .dropdown-arrow {
                font-size: 0.625rem;
                transition: transform 0.3s ease;
            }

            .language-dropdown.active .dropdown-arrow {
                transform: rotate(180deg);
            }

            .language-options {
                position: absolute;
                top: 100%;
                left: 0;
                min-width: 100%;
                background: rgba(0, 0, 0, 0.9);
                border: 0.0625rem solid #dad1b3;
                border-radius: 0.375rem;
                margin-top: 0.25rem;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-0.625rem);
                transition: all 0.3s ease;
            }

            .language-dropdown.active .language-options {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .language-option {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 0.75rem;
                color: #ebebeb;
                text-decoration: none;
                font-size: 0.875rem;
                font-family: 'Hind', sans-serif;
                transition: background-color 0.3s ease;
            }

            .language-option:hover {
                background: rgba(218, 209, 179, 0.1);
                color: #dad1b3;
            }

            @media only screen and (max-width: 30rem) {
                .maintenance-language-switcher {
                    top: 0.625rem;
                    left: 0.625rem;
                }

                .language-current {
                    padding: 0.375rem 0.625rem;
                    font-size: 0.75rem;
                }

                .language-option {
                    padding: 0.375rem 0.625rem;
                    font-size: 0.75rem;
                }
            }

            .social-media-links {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 1rem;
                margin-top: 2.5rem;
                flex-wrap: wrap;
            }

            .social-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 2.5rem;
                height: 2.5rem;
                color: #dad1b3;
                background: rgba(0, 0, 0, 0.3);
                border: 0.0625rem solid #dad1b3;
                border-radius: 50%;
                text-decoration: none;
                transition: all 0.3s ease;
            }

            .social-icon:hover {
                color: #ebebeb;
                background: rgba(218, 209, 179, 0.2);
                border-color: #ebebeb;
                transform: translateY(-0.125rem);
            }

            .social-icon svg {
                width: 1.25rem;
                height: 1.25rem;
            }

            @media only screen and (max-width: 30rem) {
                .social-media-links {
                    gap: 0.75rem;
                    margin-top: 1.875rem;
                }

                .social-icon {
                    width: 2.25rem;
                    height: 2.25rem;
                }

                .social-icon svg {
                    width: 1.125rem;
                    height: 1.125rem;
                }
            }
<?php
}
