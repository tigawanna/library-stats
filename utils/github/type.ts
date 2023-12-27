export interface BadDataGitHubError {
  message: string;
  documentation_url: string;
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

export type KeyStringObject = { [key: string]: string };

export interface RequiredDecodedPackageJson {
  name: string;
  private?: boolean;
  version: string;
  type?: string;
  scripts: KeyStringObject;
  dependencies: KeyStringObject;
  devDependencies: KeyStringObject;
  [key: string]: any | undefined;
}

export type DecodedPackageJson =
  | (RequiredDecodedPackageJson & {
      favdeps?: string[];
      pkg_type?: TPkgType;
    })
  | BadDataGitHubError;

export type PlainDecodedPackageJson = RequiredDecodedPackageJson & {
  favdeps: string[];
  pkg_type: TPkgType;
};
export type DecodedPackageJsonList = RequiredDecodedPackageJson;

export type DepsComBo = "React + Vite" | "React" | "Vite" | "Rakkasjs" | "Nextjs" | "Nodejs";

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
  dependencies: Set<string>;
  // devDependencies:string[]
  count: number;
}

export type TPkgObjs = { [key in DepsComBo]: TPkgObjValue };

export type TPkgType = "React+Vite" | "React+Relay" | "Rakkasjs" | "Nextjs" | "Nodejs" | "Others";

export const pkgTypesArr = [
  "React+Vite",
  "React+Relay",
  "Rakkasjs",
  "Nextjs",
  "Nodejs",
  "Others",
] as const;

export type TPkgTypeObj = {
  [key in (typeof pkgTypesArr)[number]]: {
    name: string | null;
    dependencies: string[];
    count: number;
  };
};

export interface PkgsRequest extends Request {
  pkgs?: IPkgRepo[];
  pkg_jsons?: DecodedPackageJson[];
}
