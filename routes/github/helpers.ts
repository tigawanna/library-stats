// deno-lint-ignore-file no-explicit-any ban-ts-comment

import { logError } from "../../utils/helpers.ts";
import { IGithubViewer, ViewerRepos, BadDataGitHubError, RequiredDecodedPackageJson, TPkgType, DecodedPackageJson, pkgTypesArr } from "./type.ts";


export async function getGithubViewer(viewer_token:string){
    try {
        const headersList = {
            "Accept": "*/*",
            "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            "Authorization": `Bearer ${viewer_token}`,
            "Content-Type": "application/json"
        }

        const response = await fetch("https://api.github.com/user", {
            method: "GET",
            headers: headersList
        });
    if(response.ok){
        const data = await response.json() as unknown as IGithubViewer
        return data
    }
    throw await response.json()

    } catch (error) {
        logError("error in the getGithubViewer catch block  ==> ", error)
        throw error
    }
}




export async function getViewerRepos(viewer_token: string) {
    // console.log("viewerr token  === ", viewer_token)
    const query = `
    query($first: Int!) {
    viewer {
    repositories(first:$first,isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes {
        id
        name
        nameWithOwner
      }
    }
  }
}
`
    try {
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {

                "Authorization": `bearer ${viewer_token}`,
                "Content-Type": "application/json",
                "accept": "application/vnd.github.hawkgirl-preview+json"
            },
            body: JSON.stringify({
                query,
                variables: {
                    first: 50
                },
                // operationName,
            }),
        })
        const data = await response.json() as unknown as ViewerRepos


        if("message" in data){
            logError("throw error fetching viewer repos  ==> ", data)
            throw data
        }
            logError("all user repositories ===== ", data)
        return data

    } catch (err) {
        console.log("catch error fetching viewer repos ==> ", err)
        return err as BadDataGitHubError
    }
}




export function pkgTypeCondition(pkg: RequiredDecodedPackageJson): { pkg_type: TPkgType; condition: boolean; } {

    if (pkg.devDependencies?.rakkasjs) {
        return { pkg_type: "Rakkasjs", condition: true }
    }

    if (pkg.dependencies?.next) {
        return { pkg_type: "Nextjs", condition: true }
    }

    if (pkg.dependencies?.react && pkg.dependencies?.['react-relay']) {
        return { pkg_type: "React+Relay", condition: true }
    }

    if (pkg.devDependencies?.vite && pkg.dependencies?.react) {
        return { pkg_type: "React+Vite", condition: true }
    }

    if ((pkg.devDependencies?.nodemon || pkg.dependencies?.nodemon || pkg.dependancies?.express)) {
        return { pkg_type: "Nodejs", condition: true }
    }
    return { pkg_type: "Others", condition: false }
}

export function createPkgObject(pkg: DecodedPackageJson) {
//@ts-expect-error
    const pkgtypeObj: { [key in typeof pkgTypesArr[number]]: any } = {}
    if ("name" in pkg)
        pkgTypesArr.map((key:any) => {
            //@ts-expect-error
            pkgtypeObj[key] = {
                name: "",
                dependencies: pkg.dependencies,
                devDependencies: new Set(),
                count: 0
            }
        })

}


export const mostFaveDepsList = [
    "tailwindcss", "supabase", "typescript", "react-router-dom", "react-icons",
    "firebase", "dayjs", "axios", "socket.io", "pocketbase", "react-to-print",
    "react-query", "rollup", "express", "graphql", "jest", "vitest", "nodemon"]

//  modify package.json to addthe pkg_type 
export function modifyPackageJson(pgkjson: DecodedPackageJson) {

    if ("name" in pgkjson) {
        const typeCondition = pkgTypeCondition(pgkjson)
        console.log("typeCondition", typeCondition)
        pgkjson['pkg_type'] = typeCondition.pkg_type

        const alldeps = Object.keys(pgkjson.dependencies).map((key) => {
            return key.split('^')[0]
        }).concat(Object.keys(pgkjson.devDependencies).map((key) => {
            return key.split('^')[0]
        })
        )

        const favdeps = mostFaveDepsList.filter((key) => {
            return alldeps.find((dep) => {
                return dep === key
            })
        })

        pgkjson['favdeps'] = favdeps
        return pgkjson

    }
    return pgkjson
}

// get repository package.json
export async function getOneRepoPackageJson(owner_repo: string, viewer_token: string) {
    try {
        const headersList = {
            "Authorization": `bearer ${viewer_token}`,
        }
        const response = await fetch(`https://api.github.com/repos/${owner_repo}/contents/package.json`, {
            method: "GET",
            headers: headersList
        });

        const data = await response.json()

        if (data && data.encoding === "base64" && data.content) {
            const stringBuffer = new TextDecoder().decode(base64ToUint8Array(data.content))
            const pgkjson = JSON.parse(stringBuffer) as DecodedPackageJson
            return await modifyPackageJson(pgkjson)
        }

        return data as DecodedPackageJson

    }
    catch (error) {
        logError("error getOneRepoPackageJson >>>>>>>>>>>> ", error)
        return error as DecodedPackageJson
    }
}

function base64ToUint8Array(base64: string): Uint8Array {
    const raw = atob(base64)
    const array = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) {
        array[i] = raw.charCodeAt(i)
    }
    return array
}


export async function computeAllPkgJsons(viewer_token:string){
try{
    const all_repos = await getViewerRepos(viewer_token)

    if (all_repos && "message" in all_repos) {
        logError("error loading  viewer repos  ==> ", all_repos)
        throw new Error("error loading  viewer repos : " + all_repos.message)
    }

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
catch(err){
    throw err
}

}
