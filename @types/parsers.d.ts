declare function handleDirectory(directoryPath: string): void;
declare function getBody(
  request: any,
  uploadDir?: string
): Promise<{ fields: any; files: any }>;
declare function extractParamNames(pattern: string): string[];
declare function patternToRegex(pattern: string): RegExp;
declare function parseCookies(request: any): { [key: string]: string };