<script lang="ts">
 import { Breadcrumbs } from '@soxa-ui/svelte'
 import type { TBreadcrumbsCollection } from '@soxa-ui/core'
 let {engine}:{engine:TBreadcrumbsCollection}=$props()
</script>
<Breadcrumbs {engine} maxItems={3}><Breadcrumbs.Item text="Home" href="#home"/><Breadcrumbs.Item text="Catalog" href="#catalog"/><Breadcrumbs.Item text="Group"/><Breadcrumbs.Item text="Phones" href="#phones"/><Breadcrumbs.Item text="Current" active/></Breadcrumbs>
