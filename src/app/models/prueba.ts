import { Cliente } from "./Cliente";
import { Producto } from "./Producto";
import { VentaCredito } from "./VentaCredito";
import { VentaCreditoDetalle } from "./VentaCreditoDetalle";

export const ejecutarPrueba = () => {

const ventaCredito1 = new VentaCredito({
    fechaEmision: "2024-12-01T00:00:00Z",
    fechaVencimiento: "2025-01-01T00:00:00Z",
    codigo: "VC001",
    cliente: new Cliente({ nombre: "Juan Pérez", id: 2 }), // Asegúrate de reemplazar con propiedades válidas del modelo Cliente
    porcentajeInteres: 5.0,
    fechaLimiteMora: "2025-01-15T00:00:00Z",
    mora: 2.0,
    detalles: [
        new VentaCreditoDetalle({
            producto: new Producto({ nombre: "Producto A", id: 1 }), // Asegúrate de usar propiedades válidas del modelo Producto
            precioUnitario: 100.0,
            cantidad: 2,
            precioNeto: 200.0
        }),
        new VentaCreditoDetalle({
            producto: new Producto({ nombre: "Producto B", id: 2 }),
            precioUnitario: 150.0,
            cantidad: 1,
            precioNeto: 150.0
        })
    ]
});

const ventaCredito2 = new VentaCredito({
    fechaEmision: "2024-11-15T00:00:00Z",
    fechaVencimiento: "2024-12-15T00:00:00Z",
    codigo: "VC002",
    cliente: new Cliente({ nombre: "María Gómez", id: 1 }),
    porcentajeInteres: 3.5,
    fechaLimiteMora: "2024-12-30T00:00:00Z",
    mora: 1.5,
    detalles: [
        new VentaCreditoDetalle({
            producto: new Producto({ nombre: "Producto C", id: 3 }),
            precioUnitario: 200.0,
            cantidad: 3,
            precioNeto: 600.0
        })
    ]
});

console.log(JSON.stringify( ventaCredito1 ))

}