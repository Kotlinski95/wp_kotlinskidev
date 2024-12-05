import './index.scss';

console.log(
	'%cWelcome to KotlinskiDev site',
	'font-size: 24px; color: #4CAF50; font-weight: bold; font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 10px; border-radius: 5px;'
);

( function () {
	const navigationMenu = document.getElementById( 'hamburger-menu' );

	const hamburgerCheckbox = document.querySelector(
		'input[name=hamburger-toggle]'
	);

  if (!hamburgerCheckbox || !navigationMenu) return;
	hamburgerCheckbox.addEventListener(
		'change',
    function (this: HTMLInputElement) {
			if ( this.checked ) {
        navigationMenu.classList.add('open');
        document.body.classList.add('scroll-lock');
			} else {
				navigationMenu.classList.remove('open');
        document.body.classList.remove('scroll-lock');
			}
		}
  );
} )();
