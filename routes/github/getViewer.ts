import { logError } from "../../utils/helpers.ts";


export async function getGithubViewer(viewer_token: string) {
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
        if (response.ok) {
            const data = await response.json() as unknown as IGithubViewer
            return data
        }
        throw await response.json()

    } catch (error) {
        logError("error in the getGithubViewer catch block  ==> ", error)
        throw error
    }
}



export interface IGithubViewer {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string;
    company: null;
    blog: string;
    location: string;
    email: string;
    hireable: null;
    bio: string;
    twitter_username: null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: Date;
    updated_at: Date;
    private_gists: number;
    total_private_repos: number;
    owned_private_repos: number;
    disk_usage: number;
    collaborators: number;
    two_factor_authentication: boolean;
    plan: ViewerPlan;
}

export interface ViewerPlan {
    name: string;
    space: number;
    collaborators: number;
    private_repos: number;
}
