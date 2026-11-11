<template>
	<span class="so-avatar-group">
		<slot />
		<span class="so-avatar-group__overflow">
			<slot name="overflow"><span class="so-avatar-group__count">+3</span></slot>
		</span>
	</span>
</template>
