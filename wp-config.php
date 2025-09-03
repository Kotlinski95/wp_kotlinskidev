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
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );

/* Add any custom values between this line and the "stop editing" line. */


// Content Protection Encryption Keys
// Add these constants to your wp-config.php file for secure key storage
define('KOTLINSKIDEV_PRIVATE_KEY', '-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWGvBCc/K6eu7N
miFKNRhmKJxm8gIvM/OTTT1aqWcg269aeBAt19RswqOS3dM1rdiV+Kx/kTcFB4ML
soV+KrpW55uFDiztje1lsC324rHIMP+V+rTX18P3dfPfr+Ocp7LtsYjC0jQBZV7M
anbporXYQY0J5rHwtlRVT/yduRk6X9GXUN7s4c1XawjkxxL4ORT3BtbJqwAlUZPu
NqPXYKZMDYzb5VAYefHMXHtSXjM4AlfuILJK8POGc/r7dhsrvQ7DC3mUiJatwPqm
rgSKjN/f7kTsKqFKSugx02+9h+0qbXGh8V/1TUiN6ON1e63nGhv8gG8G43CIBQp2
2VZYvVZFAgMBAAECggEAUy7IJalSpqzYVr0JLgGO5zHkAgMIYjp26cXajny+en+f
kzCOaKEwAMlmL8tLIdHXEf05V56dl7Chc0v6nVgQaW82du1Y+zpm/1kBoqfUloii
5CwxUqKbmmsTQtbdQaHN3JdbIQX1+ozd1eGPLZpvuANPvocInxLXlQWsicK+UHTv
19MOZhXax5zCR6+Tpr+f1xPgslF3cw0hUBrWaBpJfQM2PvN9SSUzx7YRnLAJoXLW
gM2h9vbMPBb5nTuZCQTjEtgQZ9iOWtNW+/xKBpHemuYDJNYyQYaxX+6C7EuS577B
CjAGMiwtzdFvfZ1vDIn1MYla/FMQLD/puKOg+w3dAQKBgQDq9VltHByToJj+4lXa
ttTE4pV1ovD+fvB/MWzmH92nz7bUTfL/aWh6Wz79ya2itXQnMlTbF40zqfaKlEnY
WpPW7UZ4yIHwVmk3EgxfzsG8jGGO1WuszmNGcd+R+zsIIWwzc9tuLlvS0lduONf3
znlGW4ZcrIsPZhA6YkA56fMf4QKBgQDpR4KNX2WPpIbGQod3X1ctFY07XZnLjZmP
1CHkInDw2/edm4rgDOOcMNmr6pnb4aSxMItTPlIppIQjXZv14EiGpH4WnZDfdIsV
IH4coZ0JqQtagbWIhloE+n1CIcpHT89Yl84Su5kqBkxz8HrN3Vatasd5RVoA0gEj
udCxyoQS5QKBgQDCcWEcZtNPaOy0ouKiKgRTG6DMxZfjRXIKEQEqQNzS75dCg2/B
553LBJBQvwKvULNbbM/EsOzuAI5DiQzDu9H1YE+dzXGbUCeqp4kOELFMNHDYH88I
J5UIy1xWFy93PxGoUw0ZVcwv4FryoKA6N+ktTLkZIMHEcJaleoHka7QEgQKBgAa3
f2PQrlzvcM3+lmXygdETgMiHzmjU/+nrQrqN31CgFMYd92ayGE+j/HB9xcZV/eb4
LdrMvZLjYMaf6GCw/4WY8OR3zvcQJP0LvXXXlWz0yBXoDDENJURlbfvcezWIb8Du
Rgm2CxfxrHveHbsVt2ww2eN9ArVpVo0PyZmE6j6dAoGBAKJ1zPCscAWur7Pwke8m
JISfQX5HfhAjINGimIxjYNiYseHicPHnCeB5Dwtjzaz8l342H8Sf5mwqfSEO42sf
rBwemZTGlevws4/TCRbpFy56dsdAIn514cPD/KKopSxqZPMLDLWD+f++fDAopJpt
e9qrUwjQMwq3K/jeiwJye4BS
-----END PRIVATE KEY-----
');
define('KOTLINSKIDEV_PUBLIC_KEY', '-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1hrwQnPyunruzZohSjUY
ZiicZvICLzPzk009WqlnINuvWngQLdfUbMKjkt3TNa3Ylfisf5E3BQeDC7KFfiq6
VuebhQ4s7Y3tZbAt9uKxyDD/lfq019fD93Xz36/jnKey7bGIwtI0AWVezGp26aK1
2EGNCeax8LZUVU/8nbkZOl/Rl1De7OHNV2sI5McS+DkU9wbWyasAJVGT7jaj12Cm
TA2M2+VQGHnxzFx7Ul4zOAJX7iCySvDzhnP6+3YbK70Owwt5lIiWrcD6pq4Eiozf
3+5E7CqhSkroMdNvvYftKm1xofFf9U1IjejjdXut5xob/IBvBuNwiAUKdtlWWL1W
RQIDAQAB
-----END PUBLIC KEY-----
');

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
