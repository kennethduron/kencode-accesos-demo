export type AccessStatus =
  | "autorizado"
  | "activo"
  | "utilizado"
  | "vencido"
  | "cancelado"
  | "no-encontrado";

export type DemoRole = "residente" | "seguridad" | "administracion";

export interface DemoResident {
  firstName: string;
  home: string;
  community: string;
}

export interface DemoAccess {
  visitor: string;
  visitorType: string;
  vehicle: string;
  plate: string;
  code: string;
  status: AccessStatus;
}

