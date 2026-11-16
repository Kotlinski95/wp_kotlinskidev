# PHP

Source of truth for the PHP version and PHP settings on the production server of `kotlinskidev.com`, and the runbook for upgrading it. Server values were read from the live site and over SSH on **2026-11-14**.

This repo is public. Never write IP addresses, host names, account IDs or keys into this file.

## Current state

| Item | Value |
| --- | --- |
| PHP version | 8.5.12 (upgraded from 8.2.35 on 2026-11-14) |
| How PHP runs | Apache 2.4 `mod_php` (`php_module`) with the prefork MPM |
| Operating system | Debian 12 (Bookworm) on one AWS Lightsail instance |
| PHP packages source | Sury repository, `https://packages.sury.org/php/` (Debian 12 itself only ships PHP 8.2) |
| Settings files | `/etc/php/8.5/apache2/conf.d/99-kotlinskidev.ini` and `99-kotlinskidev-opcache.ini` |
| Firewall bootstrap | Wordfence WAF loads through `auto_prepend_file` set in the root `.htaccess` |
| Old PHP | PHP 8.2 packages are still installed but its Apache module is disabled (rollback path) |

## Why this version

PHP gives each branch two years of full support and two more years of security-only fixes. Dates from [php.net/supported-versions.php](https://www.php.net/supported-versions.php) at the time of writing:

| Branch | Security support ends |
| --- | --- |
| 8.2 | 31 Dec 2026 |
| 8.3 | 31 Dec 2027 |
| 8.4 | 31 Dec 2028 |
| 8.5 | 31 Dec 2029 |

Rule of thumb: move to the newest branch that every active plugin and the theme support, and start the upgrade at the latest when the current branch has less than six months of security support left. The next deadline for 8.5 is 31 Dec 2029, so plan the next upgrade for the first half of 2029. Re-check the dates on php.net first, because they can change.

Compatibility inputs checked before the 8.5 upgrade:

- Every active plugin declares `Requires PHP` of 8.0 or lower (read from the plugin headers).
- The theme's `composer.json` requires `^8.4` with `config.platform.php` set to `8.5`, and the Local environment already ran PHP 8.5.12 (see `local.md`).
- WordPress 7.1.4 supports 8.5.

Run the same three checks before every future upgrade.

## Settings we keep

`/etc/php/<version>/apache2/conf.d/99-kotlinskidev.ini`:

```
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
```

`/etc/php/<version>/apache2/conf.d/99-kotlinskidev-opcache.ini`:

```
opcache.memory_consumption=192
opcache.interned_strings_buffer=32
```

Why: the Lightsail image sets `memory_limit` to 512M in `90-lightsail-memory.ini` and `php.ini` allows 512M uploads, left over from restoring the migration backup. On a 1 GB server that is too generous. Files in `conf.d` load in alphabetical order, so the `99-` files win. The `90-lightsail-memory.ini` file was deliberately not copied to 8.5, because it is overridden anyway. Details and rollback for these two files are in `AWS.md`.

PHP 8.5 includes OPcache in the core, so there is no separate `php8.5-opcache` package.

## Packages

Installed for PHP 8.5:

```
libapache2-mod-php8.5 php8.5-cli php8.5-common php8.5-curl php8.5-gd php8.5-mbstring php8.5-mysql php8.5-xml php8.5-zip php8.5-bz2 php8.5-intl
```

Differences from the old 8.2 set: `php8.2-mcrypt` is not installed (the extension is obsolete and no plugin needs it), `php8.2-opcache` and `php8.2-readline` are not needed (built in), and `php8.5-intl` is new. `imagick` is not installed on purpose, to save memory on the 1 GB server; image processing uses GD.

## Upgrade runbook

Use this for any later upgrade. Replace `8.5` with the target version. Run everything in the Lightsail browser SSH console, or over SSH as the `admin` user. Allow about 30 minutes and pick a quiet hour.

### 1. Take a snapshot

In the AWS Console open Lightsail, then the instance, then Snapshots, then Create snapshot. Name it `before-php-<version>-<date>` and wait for the status Available. This is the only full rollback, because automatic snapshots are off.

### 2. Record the current setup (read-only)

```
php -v | head -1
dpkg -l | awk '/^ii/ && /php8.2/ {print $2}' | tr '\n' ' '
sudo apache2ctl -M 2>/dev/null | grep -iE "php|mpm"
ls /etc/php/8.2/apache2/conf.d/
for f in /etc/php/8.2/apache2/conf.d/99-*.ini /etc/php/8.2/apache2/conf.d/90-*.ini; do echo "--- $f"; sudo cat "$f"; done
```

Compare the package list with the one above, and note every custom `.ini` file.

### 3. Add the repository (first upgrade only)

Skip this if `/etc/apt/sources.list.d/php.list` already exists.

```
sudo apt-get update
sudo apt-get install -y ca-certificates curl lsb-release apt-transport-https
sudo curl -sSLo /tmp/debsuryorg-archive-keyring.deb https://packages.sury.org/debsuryorg-archive-keyring.deb
sudo dpkg -i /tmp/debsuryorg-archive-keyring.deb
echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/php.list
sudo apt-get update
apt-cache policy php8.5-cli libapache2-mod-php8.5 | grep -E "^(php|libapache|  Candidate)"
```

Both packages must show a `Candidate` that starts with the target version. If one shows `(none)`, stop.

### 4. Install the new version next to the old one

The site keeps running on the old version, because a temporary `policy-rc.d` stops package scripts from restarting Apache. Installing the Apache module enables it in the config while the old module is still enabled, and two PHP modules cannot run together, so a restart at this point would fail.

```
printf '#!/bin/sh\nexit 101\n' | sudo tee /usr/sbin/policy-rc.d >/dev/null && sudo chmod +x /usr/sbin/policy-rc.d
sudo apt-get install -y libapache2-mod-php8.5 php8.5-cli php8.5-common php8.5-curl php8.5-gd php8.5-mbstring php8.5-mysql php8.5-xml php8.5-zip php8.5-bz2 php8.5-intl
sudo rm /usr/sbin/policy-rc.d
printf 'memory_limit = 256M\nupload_max_filesize = 64M\npost_max_size = 64M\n' | sudo tee /etc/php/8.5/apache2/conf.d/99-kotlinskidev.ini
printf 'opcache.memory_consumption=192\nopcache.interned_strings_buffer=32\n' | sudo tee /etc/php/8.5/apache2/conf.d/99-kotlinskidev-opcache.ini
/usr/bin/php8.5 -v | head -1
```

Always remove `policy-rc.d` again. If it stays, no service restarts after future package updates.

### 5. Switch Apache

The site is down for a few seconds.

```
sudo a2dismod php8.2
sudo a2enmod php8.5
sudo apache2ctl configtest
```

The last line must say `Syntax OK`. If it does not, do not restart: run the rollback below. If it does:

```
sudo systemctl restart apache2
sudo systemctl is-active apache2
sudo apache2ctl -M 2>/dev/null | grep -i php
sudo update-alternatives --set php /usr/bin/php8.5
php -v | head -1
```

Expected: `active`, `php_module (shared)`, and `PHP 8.5.x`. Restart Apache rather than reload it, because OPcache memory is only resized on a full restart.

### 6. Verify

Open `https://kotlinskidev.com/` and `/en/` in a browser, then check from the server side (through the Novamira connection or WP-CLI):

- `PHP_VERSION` is the new version and `PHP_SAPI` is `apache2handler`.
- `memory_limit` is 256M, `upload_max_filesize` and `post_max_size` are 64M, OPcache is on with 192 MB.
- `auto_prepend_file` still points to `wordfence-waf.php`, and the Wordfence WAF status is `enabled`.
- The homepage returns 200, `/en/` returns 301, `/wp-json/` returns 200, `/wp-login.php` returns 404 (the login URL is hidden by WPS Hide Login).
- `wp-content/debug.log` has no new entries, and `sudo tail -n 20 /var/log/apache2/error.log` shows no PHP warnings.

The first request after the restart can take several seconds while OPcache fills. That is normal.

### 7. Clean up after a stable week

If nothing broke, remove the old version so it cannot be enabled by accident and no longer needs security updates:

```
sudo apt-get purge 'php8.2*'
sudo apt-get autoremove
```

Check that `apache2ctl -M` still lists `php_module` afterwards. Take a new snapshot before purging if you want a clean rollback point.

## Rollback

While the old packages are still installed, rolling back takes seconds:

```
sudo a2dismod php8.5 && sudo a2enmod php8.2 && sudo systemctl restart apache2
sudo update-alternatives --set php /usr/bin/php8.2
```

After the old version is purged, restore the pre-upgrade Lightsail snapshot instead.

## Pitfalls

- **Debian 12 has no PHP 8.5 in its own repositories.** Without the Sury repository `apt` finds nothing newer than 8.2.
- **Two PHP Apache modules cannot be loaded at once.** Install with `policy-rc.d` in place and swap the modules in one go (step 5).
- **Check the web PHP, not only the command-line PHP.** `php -i` reads the CLI settings. For example it reported `memory_limit => -1` and 2M uploads while the web PHP used 256M and 64M. Verify with `ini_get()` from inside WordPress.
- **Wordfence Extended Protection survives the upgrade.** Its `.htaccess` block covers `mod_php5.c`, `mod_php7.c` and `mod_php.c`, and PHP 8 uses the last one. If the firewall ever shows as basic mode after an upgrade, re-run Wordfence, Firewall, Optimize the Wordfence Firewall.
- **Large site backups.** Restoring a big All-in-One WP Migration file needs the 512M limits again. Remove `99-kotlinskidev.ini` temporarily, restore, then put it back and restart Apache.
- **Local and production can differ.** `local.md` records that bumping the PHP version in Local once broke the Local site's database connection. Check Local separately.

## Follow-ups

- The deploy workflow still excludes the theme's `vendor/` folder because production used to run PHP 8.2, so Sentry error monitoring is off in production. With PHP 8.5 `vendor/` can be shipped. This needs a change to `.github/deploy-manifest.yml` and a deploy test, and is not done yet. See `deployment.md`.
- Purge the PHP 8.2 packages after a stable week (step 7).
- Update the PHP version in `AWS.md` whenever it changes.
