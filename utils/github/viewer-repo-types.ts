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
}

export interface PageInfo {
  endCursor: string;
  startCursor: string;
}

export interface BadDataGitHubError {
  message: string;
  documentation_url: string;
}
