<script lang="ts">
  import CodeEditor from "./CodeEditor.svelte";
  import OutputPanel from "./OutputPanel.svelte";
  import SplitPane from "./SplitPane.svelte";
  import { SigilProcessor } from "../sigil/processor";

  let yamlContent = $state(`# SIGIL Example - Fantasy Weapons
weapons:
  - sword
  - bow  
  - staff
  - dagger

materials:
  - iron
  - steel
  - elvish
  - cursed

weapon_find: "You find a [materials] [weapons]"
weapon_craft: "You craft a {masterwork|crude} [weapons] from [materials]"`);
  let templateId = $state("weapon_find");
  let output = $state("");
  let error = $state<string | null>(null);
  let isLoading = $state(false);

  const processor = new SigilProcessor();

  async function handleGenerate() {
    if (!yamlContent.trim()) return;

    isLoading = true;
    error = null;

    try {
      const result = await processor.processYaml(yamlContent, templateId);

      if (result.success) {
        output = result.output || "";
        error = null;
      } else {
        error = result.error || "Generation failed";
        output = "";
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error";
      output = "";
    } finally {
      isLoading = false;
    }
  }

  function handleYamlChange(newValue: string) {
    yamlContent = newValue;
  }

  function handleTemplateIdChange(event: Event) {
    const target = event.target as HTMLInputElement;
    templateId = target.value;
  }
</script>

<div class="h-full w-full bg-gray-800">
  <SplitPane leftLabel="YAML Editor" rightLabel="SIGIL Output">
    {#snippet leftContent()}
      <CodeEditor
        value={yamlContent}
        onchange={handleYamlChange}
        placeholder="Enter your SIGIL YAML here..."
      />
    {/snippet}

    {#snippet rightContent()}
      <OutputPanel
        content={output}
        {error}
        {isLoading}
        {templateId}
        ongenerate={handleGenerate}
        ontemplatechange={handleTemplateIdChange}
      />
    {/snippet}
  </SplitPane>
</div>
