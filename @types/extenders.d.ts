import { ServerResponse } from "http";

declare interface ResponseHelpers extends ServerResponse{
  status(statusCode: number): this;
  send(text: string): this;
  html(html: string): this;
  json(json: any): this;
  csv(csv: string): this;
  download(filepath: string, filename?: string): void;
  setCookie(
    key: string,
    value: string,
    options?: {
      maxAge?: number;
      domain?: string;
      path?: string;
      secure?: boolean;
      httpOnly?: boolean;
    }
  ): void;
  deleteCookie(key: string): void;
}