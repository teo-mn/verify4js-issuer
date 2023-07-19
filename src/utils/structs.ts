export interface CertStruct {
  id: number;
  certNum: string;
  hash: string;
  issuer: string;
  expireDate: number;
  createdAt: number;
  isRevoked: boolean;
  version: string;
  description: string;
  revokerName: string;
  revokedAt: number;
  txid: string;
}

export interface IssuerStruct {
  id: number;
  name: string;
  regnum: string;
  description: string;
  category: string;
  addr: string;
  metaDataUrl: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
