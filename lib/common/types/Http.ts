export type HttpParams = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  id: string;
  path: string;
  hostname: string;
  prefix: string;
  port: number;
  collectionName: string | Function;
  filter: string;
  raw: boolean;
};
