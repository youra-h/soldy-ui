<script lang="ts">
import SetupCodeBlock from './setup.component'
import { Tabs, TabsContent } from '../tabs'
import { Button } from '../button'
export default { ...SetupCodeBlock, components: { Tabs, TabsContent, Button } }
</script>

<template>
	<component
		:is="tag"
		ref="rootElement"
		v-if="rendered"
		v-show="visible"
		:class="classes"
		v-bind="{ ...attrs, ...aria, ...dataset }"
	>
		<!-- Keep pre/code descendants adjacent: template whitespace would alter the displayed source. -->
		<div v-if="displayTitle" class="so-code-block__header">
			<slot name="title-icon" /><span class="so-code-block__title">{{ displayTitle }}</span>
			<Button
				v-if="copyable"
				type="button"
				embedded="code-block.copy"
				class="so-code-block__copy"
				:size="size"
				:text="names_copy"
				:disabled="copyDisabled"
				@click="block.copy()"
			/>
		</div>
		<Tabs
			v-if="tabbed"
			:ctrl="block.tabs"
			:engine="block.engine"
			embedded="code-block.tabs"
			class="so-code-block__tabs"
		>
			<template v-if="copyable && !displayTitle" #trailing>
				<Button
					v-if="copyable"
					type="button"
					embedded="code-block.copy"
					class="so-code-block__copy"
					:size="size"
					:text="names_copy"
					:disabled="copyDisabled"
					@click="block.copy()"
				/>
			</template>
			<template #content>
				<TabsContent
					v-for="panel in panels"
					:key="panel.value"
					:value="panel.value"
					embedded="code-block.panel"
					class="so-code-block__content"
				>
					<pre
						class="so-code-block__pre"
						role="region"
						v-bind="{ ...contentAttrs, ...contentAria }"
						:style="contentStyle"
					><code class="so-code-block__code" v-bind="panel.dataset"><span v-for="line in panel.lines" :key="line.number" class="so-code-block__line" v-bind="line.dataset"><span v-if="lineNumbers" class="so-code-block__gutter" aria-hidden="true">{{ line.number }}</span><span class="so-code-block__text">{{ line.text }}</span></span></code></pre>
				</TabsContent>
			</template>
		</Tabs>
		<div v-else class="so-code-block__content">
			<pre
				class="so-code-block__pre"
				role="region"
				v-bind="{ ...contentAttrs, ...contentAria }"
				:style="contentStyle"
			><code class="so-code-block__code" v-bind="codeDataset"><span v-for="line in lines" :key="line.number" class="so-code-block__line" v-bind="line.dataset"><span v-if="lineNumbers" class="so-code-block__gutter" aria-hidden="true">{{ line.number }}</span><span class="so-code-block__text">{{ line.text }}</span></span></code></pre>
			<Button
				v-if="copyable && !displayTitle"
				type="button"
				embedded="code-block.copy"
				class="so-code-block__copy"
				:size="size"
				:text="names_copy"
				:disabled="copyDisabled"
				@click="block.copy()"
			/>
		</div>

		<span class="so-code-block__status" role="status" aria-live="polite" aria-atomic="true">{{
			names_message
		}}</span>
	</component>
</template>
