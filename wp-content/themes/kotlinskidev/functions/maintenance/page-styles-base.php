<?php
function kotlinskidev_print_maintenance_base_styles()
{
?>
            #sp-page {
                color: #ebebeb;
            }

            #sp-page .sp-header-tag-h1,
            #sp-page .sp-header-tag-h2,
            #sp-page .sp-header-tag-h3,
            #sp-page .sp-header-tag-h4,
            #sp-page .sp-header-tag-h5,
            #sp-page .sp-header-tag-h6 {
                color: #dad1b3;
            }

            #sp-page h1,
            #sp-page h2,
            #sp-page h3,
            #sp-page h4,
            #sp-page h5,
            #sp-page h6 {
                color: #ebebeb;
                font-family: 'Hind', Times, serif;
                font-weight: 700;
                font-style: normal;
            }

            #sp-page a {
                color: #dad1b3;
            }

            #sp-page a:hover {
                color: #c9bc91;
            }

            #sp-page .btn {
                background-color: #dad1b3;
            }

            .sp-image-block {
                margin-top: 4.375rem;
            }

            @media only screen and (max-width: 30rem) {

                .sp-headline-block-y0sc75,
                #sp-y0sc75,
                #y0sc75 {
                    font-size: 2rem !important;
                    text-align: center !important;
                }

                .sp-text-wrapper-p7ef8k,
                #sp-p7ef8k,
                #p7ef8k {
                    text-align: center !important;
                }

                #sp-d4et4f {
                    height: 0.625rem !important;
                }

                #sp-button-parent-q09cvl {
                    text-align: center !important;
                }

                .sp-image-block {
                    margin-top: 0px;
                }

                .sp-el-section,
                .sp-el-row {
                    padding-top: 0px !important;
                    padding-bottom: 0px !important;
                }
            }

            @media only screen and (min-width: 30.0625rem) and (max-width: 64rem) {
                .sp-image-block {
                    margin-top: -3.75rem;
                }
            }

            body {
                overflow: hidden;
                font-size: 1rem;
                min-height: 100svh;
                background: rgb(10, 10, 10);
            }

            .sp-html {
                background: rgb(10, 10, 10);
            }

            @supports not (min-height: 100svh) {
                body {
                    min-height: 100vh;
                }
            }

            #sp-page {
                max-height: 100svh;
                overflow: auto;
            }

            .social-grid {
                display: flex;
            }

            .sp-el-col:empty {
                display: none;
            }

            .social-icon {
                color: #fff !important;
            }

            .social-icon:hover {
                color: white !important;
            }

            .social-icon i {
                margin: 0;
            }

            .sp-button-wrapper {
                padding: 0;
            }

            .mail-button:hover {
                background: #ebebeb !important;
                color: #0a0a0a !important;
            }

            .sp-image-wrapper img {
                max-width: 8.75rem !important;
            }

            .wp-login {
                opacity: 0 !important;
            }

<?php
}
