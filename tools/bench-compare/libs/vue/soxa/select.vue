<script setup lang="ts">
import { Select } from '@soxa-ui/vue'
import { COLLECTION_ITEMS } from '../../../data'

defineOptions({ name: 'SoxaSelectPage' })
</script>

<template>
	<Select placeholder="Выберите" editable :items="COLLECTION_ITEMS" />
</template>
