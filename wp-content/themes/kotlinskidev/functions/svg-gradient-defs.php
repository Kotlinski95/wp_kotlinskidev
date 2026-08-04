<?php

function kotlinskidev_render_svg_gradient_defs(): void {
	?>
	<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true" focusable="false">
		<defs>
			<linearGradient id="kt-icon-gradient-dark" x1="100%" y1="0%" x2="0%" y2="0%">
				<stop offset="0%" stop-color="rgb(184,150,255)"/>
				<stop offset="60%" stop-color="rgb(0,246,255)"/>
				<stop offset="100%" stop-color="rgb(0,255,240)"/>
			</linearGradient>
			<linearGradient id="kt-icon-gradient-light" x1="100%" y1="0%" x2="0%" y2="0%">
				<stop offset="0%" stop-color="rgb(132,83,210)"/>
				<stop offset="60%" stop-color="rgb(0,71,255)"/>
				<stop offset="100%" stop-color="rgb(0,120,194)"/>
			</linearGradient>
		</defs>
	</svg>
	<?php
}

add_action('wp_body_open', 'kotlinskidev_render_svg_gradient_defs');
