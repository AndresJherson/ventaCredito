import { Model, Prop } from "./Model";

export class Cliente extends Model
{
    @Prop.Set() nombre?: string;
    @Prop.Set() apellido?: string;
    @Prop.Set() telefono?: number;
    @Prop.Set() correo?: string;


    constructor( item?: Partial<Cliente> )
    {
        super();
        Prop.initialize( this, item );
    }
}