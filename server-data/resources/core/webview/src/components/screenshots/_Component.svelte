<script lang="ts">
  import { onMount } from "svelte";
  import { ScreenshotManager } from "./Screenshot";
  import { emitServer, onEvent } from "../../helpers/Message";

  const manager: ReturnType<typeof ScreenshotManager> = ScreenshotManager();
  let container: HTMLDivElement;

  const onResize = () => {};

  const onScreenshotRequest = (data: Request) => {
    manager.onNewRequest({
      id: 1,

      encoding: "png",
      quality: 0.92,

      onFinished(data) {
        emitServer("processComplete", { imageData: data });
      },
    });
  };

  onMount(() => {
    window.addEventListener("resize", onResize);
    const events = [onEvent<Request>("requestScreenshot", onScreenshotRequest)];

    manager.init(container);

    return () => {
      events.forEach((e) => e());
      window.removeEventListener("resize", onResize);
    };
  });
</script>

<div class="hidden" bind:this={container}></div>
