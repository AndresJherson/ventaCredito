import { Model, Prop } from "./Model";

export class Producto extends Model
{
    @Prop.Set() nombre?: string;
    @Prop.Set() costo?: number;
    @Prop.Set() precio?: number;


    constructor( item?: Partial<Producto> )
    {
        super();
        Prop.initialize( this, item );
    }
}