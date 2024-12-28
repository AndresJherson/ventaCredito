import { inject, Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { ModalService } from '../modal.service';
import { Producto } from '../../models/Producto';
import { map, tap } from 'rxjs';
import { StateRowTableComponent, TableComponent, TableComponentVm } from '../../views/CollectionComponents/table/table.component';
import { PropBehavior } from '../../models/Model';
import { OverlayService } from '../overlay.service';
import { ComponentStore } from '../ComponentStore';
import { ObjectComponent, StateObjectComponent } from '../../views/ObjectComponents/object/object.component';
import { MessageBoxComponent } from '../../views/Components/message-box/message-box.component';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

    httpService = inject( HttpService );
    modalService = inject( ModalService );


    getCollection()
    {
        return this.httpService.get<Producto[]>( 'productos' )
        .pipe( map( data => data.map( item => new Producto( item ) ) ) )
    }

    getItem( producto: Producto )
    {
        return this.httpService.getById<Producto>({
            service: 'productos',
            id: producto.id
        })
        .pipe( map( item => new Producto( item ) ) )
    }

    createItem( producto: Producto )
    {
        return this.httpService.post({
            service: 'productos',
            values: { ...producto }
        })
    }

    updateItem( producto: Producto )
    {
        return this.httpService.put({
            service: 'productos',
            values: { ...producto }
        })
    }

    deleteItem( producto: Producto )
    {
        return this.httpService.delete({
            service: 'productos',
            id: producto.id
        })
    }


    tableBindingProperties: TableComponentVm<Producto>['bindingProperties'] = [
        { title: 'Id', getValue: item => item.id, behavior: PropBehavior.number },
        { title: 'Nombre', getValue: item => item.nombre, behavior: PropBehavior.string },
        { title: 'Costo', getValue: item => item.costo, behavior: PropBehavior.number},
        { title: 'Precio', getValue: item => item.precio, behavior: PropBehavior.number},
    ];


    openTableComponent( overlayService: OverlayService )
    {
        return overlayService.open( TableComponent<Producto> ).pipe(
            tap( c => {
                
                c.store

                c.vm$.next({
                    title: 'Productos',
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
                    this.openObjectComponent( c.store, c.store.storeFromThis( () => new Producto() ) )
                    .subscribe( oc => oc.vm$.next({ ...oc.vm$.value, state: StateObjectComponent.create }) )
                ) );

                c.sub.add( c.onSelectItem.subscribe( e => 
                    this.openObjectComponent( c.store, c.store.storeFromThisAsync( new Producto(), this.getItem( e.item ) ) )
                    .subscribe( oc => oc.vm$.next({ ...oc.vm$.value, state: StateObjectComponent.read }) )
                ) );

            } )
        );
    }


    openTableComponent2selectItem()
    {
        return this.modalService.open( TableComponent<Producto> ).pipe(
            tap( c => {

                c.store.setRead( this.getCollection() )
                        .getRead()
                        .subscribe();

                c.vm$.next({
                    ...c.vm$.value,
                    title: 'Productos',
                    stateRow: StateRowTableComponent.radioButton,
                    bindingProperties: this.tableBindingProperties
                });

            } )
        )
    }


    openObjectComponent( parentStore: ComponentStore<Producto[]>, store: ComponentStore<Producto> )
    {
        return this.modalService.open( ObjectComponent<Producto> )
        .pipe(
            tap( c => {

                c.store = store;

                c.vm$.next({
                    title: 'Producto',
                    isCloseActive: true,
                    state: StateObjectComponent.read,
                    bindingProperties: [
                        { title: 'Id', getValue: item => item.id, behavior: PropBehavior.number },
                        { title: 'Nombre', getValue: item => item.nombre, setValue: ( item, value ) => item.set({ nombre: value }), required: true, behavior: PropBehavior.string },
                        { title: 'Costo', getValue: item => item.costo, setValue: ( item, value ) => item.set({ costo: value }), required: true, behavior: PropBehavior.number },
                        { title: 'Precio', getValue: item => item.precio, setValue: ( item, value ) => item.set({ precio: value }), required: true, behavior: PropBehavior.number },
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

