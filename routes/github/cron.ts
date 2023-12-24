// deno function to read all repos write them to a devo kv key and then
// start fro the beginning of the array grab the repo name , useit to fetch the repo package.json withhe function getRepoPkg()
//  do it for the five next array items then save the next item id into a poiter key in kv 
//  and set a cron fro 30 minutes later which will start from the saved pointer

import { logError } from "../../utils/helpers.ts";
import { getOneRepoPackageJson, getViewerRepos } from "./helpers.ts";
import { DecodedPackageJson } from "./type.ts";


//  initiate chain of 5 at a time
export async function initiateRepoStatsCompute(viewer_token: string, viewer_name: string) {
    try {
        const all_repos = await getViewerRepos(viewer_token)
        console.log({ all_repos })
        if(all_repos && "message" in all_repos){
            logError("error loading  viewer repos  ==> ", all_repos)
            throw new Error("error loading  viewer repos : " + all_repos.message)
        }
        const repo_list = all_repos.data.viewer.repositories.nodes
        .map(repo => repo.nameWithOwner)
        const kv = await Deno.openKv();
        await kv.set([viewer_name,"repo_list"],repo_list)
        //  grab and save frist 10 repos to kv

        repo_list.slice(0, 10).map(async (repo) => {
            
        })
        for await (const repo of repo_list) {
            const pkgjson = await getOneRepoPackageJson(repo, viewer_token);
            if (pkgjson) {
                await kv.set([viewer_name, repo], pkgjson);
            }
        }
        
        await kv.set([viewer_name, "next_index"], 10)
    
        Deno.cron("GITHUB_CRON", "*/30 * * * *", () => {
            computeNextTenItems(viewer_token, viewer_name);
        });
    return all_repos
    }
    catch (err) {
        throw err
    }
}

async function computeNextTenItems(viewer_token: string, viewer_name: string) {
    const kv = await Deno.openKv();
    const next_index = await kv.get<number>([viewer_name, "next_index"]);
    const repo_list = await kv.get<string[]>([viewer_name, "repo_list"]);

    if (!next_index.value) {
        throw new Error("error loading  viewer repos : ");
    }
    if (!repo_list.value) {
        throw new Error("error loading  viewer repos");
    }

   
        if(next_index.value !== -1 && next_index.value < repo_list.value.length){
            for await (const repo of repo_list.value.slice(next_index.value, next_index.value + 10)) {
                const pkgjson = await getOneRepoPackageJson(repo, viewer_token);
                if (pkgjson) {
                    await kv.set([viewer_name, repo], pkgjson);
                }
            }
            const next_item_idx = next_index.value + 10
            await kv.set([viewer_name, "next_index"], next_item_idx)
        }
    
}



export async function computeAllPkgJsonsFiveAtaTime(viewer_token: string, viewer_name: string) {
    try {
        const all_repos = await getViewerRepos(viewer_token)

        if (all_repos && "message" in all_repos) {
            logError("error loading  viewer repos  ==> ", all_repos)
            throw new Error("error loading  viewer repos : " + all_repos.message)
        }
        const kv = await Deno.openKv();
        const kv_contents = await kv.get([viewer_name]);


        const reposPkgJson: DecodedPackageJson[] = [];


        if (all_repos && "data" in all_repos) {
            const reposList = all_repos.data.viewer.repositories.nodes
            for await (const repo of reposList) {
                const pkgjson = await getOneRepoPackageJson(repo.nameWithOwner, viewer_token);
                if (pkgjson) {
                    reposPkgJson.push(pkgjson);
                }
            }
        }
        return reposPkgJson
    }
    catch (err) {
        throw err
    }

}
