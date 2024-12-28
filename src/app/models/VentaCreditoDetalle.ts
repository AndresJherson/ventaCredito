import { Model, Prop, PropBehavior } from "./Model";
import { Producto } from "./Producto";

export class VentaCreditoDetalle extends Model
{
    @Prop.Set( PropBehavior.model, () => Producto ) producto?: Producto;
    @Prop.Set() precioUnitario?: number;
    @Prop.Set() cantidad?: number;
    @Prop.Set() precioNeto?: number;


    constructor( item?: Partial<VentaCreditoDetalle> )
    {
        super();
        Prop.initialize( this, item );
    }
}