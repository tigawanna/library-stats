import { Edge } from "./getViewerRepos.ts";

interface EnqueueRepoPackagesCompoutemprops {
  repos: Edge[];
  viewer_token: string;
}

export async function enqueueRepoPackagesCompute(
  { repos, viewer_token }: EnqueueRepoPackagesCompoutemprops,
) {
  try {
    // const kv =await Deno.openKv("https://api.deno.com/databases/80135a8a-6c16-4f9f-ae52-5100637fed23/connect");
    const kv = await Deno.openKv();
    // const viewer = await getGithubViewer(viewer_token);

    // console.log("-======= enqueueing repos for ====== ", viewer.name);
    const enqueueItems = async () => {
      for await (const [index, item] of repos.entries()) {
        const hundredth = Math.floor(index / 20);
        // const delay = 1000 * 60 * (index + 1);
        if ("documentation_url" in item && "message" in item) return;
        const delay = Math.max(1, 1000 * (index + 2) * (hundredth + 1));
        // console.log("=== QUEUE ITEM ==== ", item);
        // console.log("=== DELAY === ", delay);
        await kv.enqueue(
          { message: "repo_pkgjson_queue", value: item, viewer_token },
          {
            delay,
          },
        );
      }
    };
    await enqueueItems();
  } catch (error) {
    throw error;
  }
}
