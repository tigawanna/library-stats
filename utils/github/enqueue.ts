import { getOneRepoPackageJson } from "./getOneRepoLibraries.ts";
import { getGithubViewer } from "./getViewer.ts";
import { Edge } from "./getViewerRepos.ts";

interface EnqueueRepoPackagesCompoutemprops {
  repos: Edge[];
  viewer_token: string;
}

export async function enqueueRepoPackagesCompute(
  { repos, viewer_token }: EnqueueRepoPackagesCompoutemprops,
) {
  try {
    const kv = await Deno.openKv();
    const viewer = await getGithubViewer(viewer_token);

console.log("-======= enqueueing repos for ====== ", viewer.name);
    const enqueueItems = async () => {
      for await (const [index, item] of repos.entries()) {
        const hundrecth = Math.floor(index / 50);
        // const delay = 1000 * 60 * (index + 1);

        if ("documentation_url" in item && "message" in item) return;
        const delay = Math.max(1, 1000 * (index + 1) * (hundrecth + 1));
        console.log("=== QUEUE ITEM ==== ", item);
        console.log("=== DELAY === ", delay);
        await kv.enqueue({ message: "repo_pkgjson_queue", value: item }, {
          delay,
        });
      }
    };
    await enqueueItems();

   await kv.listenQueue(async (msg) => {
      const data = msg as { message: string; value: Edge };

      if (!data.value) {
        return;
      }
      if (!data.message) {
        return;
      }
      if (data.message === "repo_pkgjson_queue") {
        console.log("writing data ==== ", data.value);
        const pkgjson = await getOneRepoPackageJson(
          data.value.node.nameWithOwner,
          viewer_token,
        );
        if (!pkgjson) return;
        if ("documentation_url" in pkgjson || "message" in pkgjson) return;
        await kv.set([
          "repo_pkgjson",
          viewer.name,
          data.value.node.nameWithOwner,
        ], pkgjson);
      }
      return;
    });
  } catch (error) {
    throw error;
  }
}
