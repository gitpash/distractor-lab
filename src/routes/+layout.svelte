<script lang="ts">
    import "./layout.css";
    import "./../lib/design.css";
    import { t } from "svelte-i18n";
    import "$lib/i18n";
    import Heading from "$lib/heading.svelte";

    let { children } = $props();
</script>

<svelte:head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{$t("app.title")}</title>
</svelte:head>

<Heading />

{@render children()}
