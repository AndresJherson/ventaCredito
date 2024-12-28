import { Cliente } from "./Cliente";
import { Model, Prop, PropBehavior } from "./Model";
import { VentaCreditoDetalle } from "./VentaCreditoDetalle";

export class VentaCredito extends Model
{
    @Prop.Set( PropBehavior.datetime ) fechaEmision?: string;
    @Prop.Set( PropBehavior.datetime ) fechaVencimiento?: string;
    @Prop.Set() codigo?: string;
    @Prop.Set( PropBehavior.model, () => Cliente ) cliente?: Cliente;
    @Prop.Set() porcentajeInteres?: number;
    @Prop.Set( PropBehavior.datetime ) fechaLimiteMora?: string;
    @Prop.Set() mora?: number;
    
    @Prop.Set( PropBehavior.array, () => VentaCreditoDetalle ) detalles: VentaCreditoDetalle[] = [];


    constructor( item?: Partial<VentaCredito> )
    {
        super();
        Prop.initialize( this, item );
    }
}