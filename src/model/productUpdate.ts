export interface ProductUpdateBody {
    nombre?: string;
    precio?: string | number;
    stock_disponible?: string | number;
    stock_total?: string | number;
    activo?: string | number;
    accesorio?: string | number;
    porcDesc?: string | number;
    destacado?: string | number;
    bodega?: string;
    cosecha?: string;
    region?: string;
    crianza?: string;
    descUno?: string;
    descDos?: string;
    faseGus?: string;
    faseOlf?: string;
    faseVis?: string;
    grado?: string;
    maridaje?: string;
    temp?: string;
    tipo?: string;
    ubicacion?: string;
    vino?: string;
    detalle?: string;
    promocion?: string
  }