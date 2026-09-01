<?php
echo kotlinskidev_render_project_card_embed( absint( $attributes['cardId'] ?? 0 ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kotlinskidev_render_project_card_embed() renders trusted, already-escaped block template output
