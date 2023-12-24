



export interface IGithubViewer {
    login:                     string;
    id:                        number;
    node_id:                   string;
    avatar_url:                string;
    gravatar_id:               string;
    url:                       string;
    html_url:                  string;
    followers_url:             string;
    following_url:             string;
    gists_url:                 string;
    starred_url:               string;
    subscriptions_url:         string;
    organizations_url:         string;
    repos_url:                 string;
    events_url:                string;
    received_events_url:       string;
    type:                      string;
    site_admin:                boolean;
    name:                      string;
    company:                   null;
    blog:                      string;
    location:                  string;
    email:                     string;
    hireable:                  null;
    bio:                       string;
    twitter_username:          null;
    public_repos:              number;
    public_gists:              number;
    followers:                 number;
    following:                 number;
    created_at:                Date;
    updated_at:                Date;
    private_gists:             number;
    total_private_repos:       number;
    owned_private_repos:       number;
    disk_usage:                number;
    collaborators:             number;
    two_factor_authentication: boolean;
    plan:                      ViewerPlan;
}

export interface ViewerPlan {
    name:          string;
    space:         number;
    collaborators: number;
    private_repos: number;
}


export interface BadDataGitHubError {
    message: string
    documentation_url: string
}

export interface ViewerRepos {
    data: Data 
}

export interface Data {
    viewer: Viewer
}

export interface Viewer {
    repositories: Repositories
}

export interface Repositories {
    totalCount: number
    nodes: Node[]
}

export interface Node {
    id: string
    name: string
    nameWithOwner: string
}


export interface IPkgRepo {
    id: string;
    name: string;
    nameWithOwner: string;
}




export interface RepoRawPKGJSON {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    content: string;
    encoding: string;
    _links: RepoRawPKGJSONLinks;
}

export interface RepoRawPKGJSONLinks {
    self: string;
    git: string;
    html: string;
}


export type KeyStringObject = { [key: string]: string }

export interface RequiredDecodedPackageJson {
    name: string
    private?: boolean
    version: string
    type?: string
    scripts: KeyStringObject
    dependencies: KeyStringObject
    devDependencies: KeyStringObject
    [key: string]: any | undefined;

}

export type DecodedPackageJson = (RequiredDecodedPackageJson & {
    favdeps?: string[],
    pkg_type?: TPkgType
}) | BadDataGitHubError

export type PlainDecodedPackageJson = (RequiredDecodedPackageJson & {
    favdeps: string[],
    pkg_type: TPkgType
})
export type DecodedPackageJsonList = (RequiredDecodedPackageJson)


export type DepsComBo = "React + Vite" | "React" | "Vite" | "Rakkasjs" | "Nextjs" | "Nodejs"

export interface Packageinfo {
    name: string;
    version: string;
    type?: string;
    scripts: Record<string, string> | undefined;
    dependencies: Record<string, string> | undefined;
    devDependencies: Record<string, string> | undefined;
}


export interface TPkgObjValue {
    name: string;
    dependencies: Set<string>
    // devDependencies:string[]
    count: number;
}

export type TPkgObjs = { [key in DepsComBo]: TPkgObjValue }

export type TPkgType = "React+Vite" | "React+Relay" | "Rakkasjs" | "Nextjs" | "Nodejs" | "Others"

export const pkgTypesArr = ["React+Vite", "React+Relay", "Rakkasjs", "Nextjs", "Nodejs", "Others"] as const

export type TPkgTypeObj = { [key in typeof pkgTypesArr[number]]:
    {
        name: string | null;
        dependencies: string[];
        count: number
    } }



// export type IMostFaveDeps = `${typeof mostFaveDepsList[number]}`;






export interface PkgsRequest extends Request {
    pkgs?: IPkgRepo[];
    pkg_jsons?:DecodedPackageJson[]
}
