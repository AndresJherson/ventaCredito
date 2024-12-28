import { inject, Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { ModalService } from '../modal.service';
import { VentaCredito } from '../../models/VentaCredito';
import { map, tap } from 'rxjs';
import { StateRowTableComponent, TableComponent, TableComponentVm } from '../../views/CollectionComponents/table/table.component';
import { Prop, PropBehavior } from '../../models/Model';
import { MessageBoxComponent } from '../../views/Components/message-box/message-box.component';
import { ObjectComponent, StateObjectComponent } from '../../views/ObjectComponents/object/object.component';
import { ComponentStore } from '../ComponentStore';
import { OverlayService } from '../overlay.service';

@Injectable({
  providedIn: 'root'
})
export class VentaCreditoService {

    httpService = inject( HttpService );
    modalService = inject( ModalService );


    getCollection()
    {
        return this.httpService.get<VentaCredito[]>( 'venta_credito' )
        .pipe( map( data => data.map( item => new VentaCredito( item ) ) ) )
    }

    getItem( ventaCredito: VentaCredito )
    {
        return this.httpService.getById<VentaCredito>({
            service: 'venta_credito',
            id: ventaCredito.id
        })
        .pipe( map( item => new VentaCredito( item ) ) )
    }

    createItem( ventaCredito: VentaCredito )
    {
        return this.httpService.post({
            service: 'venta_credito',
            values: { ...ventaCredito }
        })
    }

    updateItem( ventaCredito: VentaCredito )
    {
        return this.httpService.put({
            service: 'venta_credito',
            values: { ...ventaCredito }
        })
    }

    deleteItem( ventaCredito: VentaCredito )
    {
        return this.httpService.delete({
            service: 'venta_credito',
            id: ventaCredito.id
        })
    }


    tableBindingProperties: TableComponentVm<VentaCredito>['bindingProperties'] = [
        { title: 'Id', getValue: item => item.id, behavior: PropBehavior.number },
        { title: 'Fecha Emisión', getValue: item => item.fechaEmision, behavior: PropBehavior.string },
        { title: 'Fecha Vencimiento', getValue: item => item.fechaEmision, behavior: PropBehavior.string },
        { title: 'Cliente', getValue: item => item.cliente?.nombre, behavior: PropBehavior.string},
        { title: 'Codigo', getValue: item => item.codigo, behavior: PropBehavior.string},
        { title: 'Importe Neto', getValue: item => 200, behavior: PropBehavior.number }
    ];


    openTableComponent( overlayService: OverlayService )
    {
        return overlayService.open( TableComponent<VentaCredito> ).pipe(
            tap( c => {
                
                c.store

                c.vm$.next({
                    title: 'Ventas',
                    isCloseButtonActive: false,
                    isHeadActive: true,
                    stateRow: StateRowTableComponent.select,
                    bindingProperties: this.tableBindingProperties  
                });

                c.buttonsMenuComponentVm$.next({
                    buttons: [ 
                        c.recordActions.addItem
                    ]
                });

                c.sub.add( c.onClose.subscribe( () => overlayService.close( c ) ) );

                c.sub.add( c.onAddItem.subscribe( e => 
                    this.openObjectComponent( c.store, c.store.storeFromThis( () => new VentaCredito() ) )
                    .subscribe( oc => oc.vm$.next({ ...oc.vm$.value, state: StateObjectComponent.create }) )
                ) );

                c.sub.add( c.onSelectItem.subscribe( e => 
                    this.openObjectComponent( c.store, c.store.storeFromThisAsync( new VentaCredito(), this.getItem( e.item ) ) )
                    .subscribe( oc => oc.vm$.next({ ...oc.vm$.value, state: StateObjectComponent.read }) )
                ) );

            } )
        );
    }


    openTableComponent2selectItem()
    {
        return this.modalService.open( TableComponent<VentaCredito> ).pipe(
            tap( c => {

                c.store.setRead( this.getCollection() )
                        .getRead()
                        .subscribe();

                c.vm$.next({
                    ...c.vm$.value,
                    title: 'Ventas',
                    stateRow: StateRowTableComponent.radioButton,
                    bindingProperties: this.tableBindingProperties
                });

            } )
        )
    }


    openObjectComponent( parentStore: ComponentStore<VentaCredito[]>, store: ComponentStore<VentaCredito> )
    {
        return this.modalService.open( ObjectComponent<VentaCredito> )
        .pipe(
            tap( c => {

                c.store = store;

                c.vm$.next({
                    title: 'VentaCredito',
                    isCloseActive: true,
                    state: StateObjectComponent.read,
                    bindingProperties: [
                        { title: 'Id', getValue: item => item.id, behavior: PropBehavior.number },
                        // { title: 'Nombre', getValue: item => item.nombre, setValue: ( item, value ) => item.set({ nombre: value }), required: true, behavior: PropBehavior.string },
                        // { title: 'Costo', getValue: item => item.costo, setValue: ( item, value ) => item.set({ costo: value }), required: true, behavior: PropBehavior.number },
                        // { title: 'Precio', getValue: item => item.precio, setValue: ( item, value ) => item.set({ precio: value }), required: true, behavior: PropBehavior.number },
                    ]
                });


                c.sub.add( c.onUpdate.subscribe( e => {

                    this.updateItem( e.item ).subscribe({
                        next: () => this.getItem( e.item ).subscribe( item => {

                            store.setRead( this.getItem( item ) )
                            c.vm$.next({ ...c.vm$.value, state: StateObjectComponent.read });

                            parentStore.getRead().subscribe();

                        } ),
                        error: error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error )
                    });

                } ) );

                c.sub.add( c.onCreate.subscribe( e => {

                    this.createItem( e.item ).subscribe({
                        next: () => this.getItem( e.item ).subscribe( item => {

                            store.setRead( this.getItem( item ) )
                            c.vm$.next({ ...c.vm$.value, state: StateObjectComponent.read });

                            parentStore.getRead().subscribe();

                        } ),
                        error: error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error )
                    });

                } ) );

                c.sub.add( c.onDelete.subscribe( e => {

                    this.deleteItem( e.item ).subscribe({
                        next: () => {
                            c.close( e.event );
                            parentStore.getRead().subscribe();
                        },
                        error: error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error )
                    });

                } ) );

            } )
        );
    }
}

