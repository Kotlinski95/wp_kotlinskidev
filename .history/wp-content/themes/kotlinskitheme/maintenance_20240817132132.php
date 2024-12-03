<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php _e('Maintenance Mode', 'your-theme'); ?></title>
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f1f1f1;
            color: #333;
            font-family: Arial, sans-serif;
            text-align: center;
        }
        h1 {
            font-size: 2em;
        }
        p {
            font-size: 1.2em;
        }
    </style>
</head>
<body>
    <div>
        <h1><?php _e('We Are Currently Under Maintenance', 'your-theme'); ?></h1>
        <p><?php _e('We will be back shortly. Thank you for your patience.', 'your-theme'); ?></p>
    </div>
</body>
</html>
