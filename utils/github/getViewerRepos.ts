import { logError } from "../helpers.ts";

export async function getViewerRepos(
  viewer_token: string,
  cursor: string | null = null,
): Promise<{ data: ViewerRepos | null; error: BadDataGitHubError | null }> {
  // console.log("viewerr token  === ", viewer_token)
  const query = `
    query($first: Int!,$after: String) {
    viewer {
    repositories(      
     first: $first
      after: $after
      isFork: false
      orderBy: {field: PUSHED_AT, direction: DESC}
      ) {

      edges {
        node {
          id
          name
          nameWithOwner
          languages(first: 10) {
            edges {
              node {
                id
                name
                color
              }
            }
          }
        }
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
      }
    }
  }
}
`;
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `bearer ${viewer_token}`,
        "Content-Type": "application/json",
        "accept": "application/vnd.github.hawkgirl-preview+json",
      },
      body: JSON.stringify({
        query,
        variables: {
          first: 50,
          after: cursor,
        },
        // operationName,
      }),
    });
    const data = await response.json() as unknown as ViewerRepos;

    if ("message" in data) {
      logError("throw error fetching viewer repos  ==> ", data);
      return { data: null, error: data as unknown as BadDataGitHubError };
    }
    // logSuccess("all user repositories ===== ", data);
    return { data, error: null };
  } catch (err) {
    console.log("catch error fetching viewer repos ==> ", err);
    return { data: null, error: err as BadDataGitHubError };
  }
}

export interface ViewerRepos {
  data: Data;
}

export interface Data {
  viewer: Viewer;
}

export interface Viewer {
  repositories: Repositories;
}

export interface Repositories {
  edges: Edge[];
  totalCount: number;
  pageInfo: PageInfo;
}

export interface Edge {
  cursor: string;
  node: Node;
}

export interface Node {
  id: string;
  name: string;
  nameWithOwner: string;
  languages: Languages;
}

export interface Languages {
  edges: LanguageEdge[]
}

export interface LanguageEdge {
  node: LanguageNode
}

export interface LanguageNode {
  id: string
  name: string
  color: string
}

export interface PageInfo {
  endCursor: string;
  startCursor: string;
}

export interface BadDataGitHubError {
  message: string;
  documentation_url: string;
}
