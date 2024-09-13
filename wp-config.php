<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress_adriankotlinski' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'ZnVZ(/geHtYVzdMLI1fzu$qN&>&|V9y<;8D;O|&Ffbari_TWd%hLR[wff&>`>B(~' );
define( 'SECURE_AUTH_KEY',  'TFNgswc}9A0MzSpF&+{Rh[@XEpY)i,m.qi#N*Ohs3/(+xJQV5GC_OgPBkfl,!&WD' );
define( 'LOGGED_IN_KEY',    'Ym;dqoAK(xY4m,B.9fz$I3$NtTmq1@c#1@Gg6G7Vqr`t^R>O-$@D!a/isCBxN93:' );
define( 'NONCE_KEY',        '/5R3_6G!?8,_CMr3hA/Gt7%zZ;$ro9.1:kTJtrjl}rWdx@Rv5#/CsHSO4TR@dLVT' );
define( 'AUTH_SALT',        '#+j[`!ypi9JnY8/<wxM?!m-Jo{y_W^EQi`jNbC*?-6 {Bo#n[Fg.Lf_6sTs7:tJz' );
define( 'SECURE_AUTH_SALT', 'SM>N;0P=9~wYL3+;nJM/##,8l/|M 9Bv2 y_@zAJC<>(JSmrB=X%!?PGiS&>.Atw' );
define( 'LOGGED_IN_SALT',   'Rj%}b.bgXX~8_gMll[rftK<40%l. #y&th;aJJJQFvs46?{7:NI2upw#[bNAUG4$' );
define( 'NONCE_SALT',       ']I1%>f/hO8?wHqMq?jzhc!MFKMgyk$e+RF)D8wNDfD[;p%[~;!di>!BfjkX&yD|.' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
