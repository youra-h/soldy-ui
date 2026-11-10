<script lang="ts">
 import { CodeBlock } from '@soxa-ui/svelte'
 const snippets = [{ value: 'first', label: 'First', code: 'one' }, { value: 'second', label: 'Second', code: '<img src=x>\n' }]
</script>
<CodeBlock {snippets} value="second" lineNumbers />
