<script lang="ts">
  import "../app.css";
  import HeaderBar from "$lib/components/HeaderBar.svelte";

  let { children } = $props();
</script>

<div class="app-container">
  <HeaderBar />
  <main class="app-main">
    {@render children()}
  </main>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .app-main {
    flex: 1;
    overflow: hidden;
  }
</style>
