import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IComponent } from '../../../interfaces/IComponent';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { ItemType } from '../../../interfaces/ItemType';
import { ModalService } from '../../../services/modal.service';
// import Enumerable from 'linq';
import { BUTTON_CLASS_BOOTSTRAP } from '../../../utils/ButtonsClass';
import { FormsModule } from '@angular/forms';
import { ComponentStore } from '../../../services/ComponentStore';
import { InputSearchComponent, InputSearchComponentEventData, InputSearchComponentVm } from '../../Components/input-search/input-search.component';
import { ButtonsFooterComponent, ButtonsFooterComponentVm } from '../../Components/buttons-footer/buttons-footer.component';
import { ButtonsMenuComponent, ButtonsMenuComponentVm } from '../../Components/buttons-menu/buttons-menu.component';
import { MessageBoxComponent } from '../../Components/message-box/message-box.component';
import { PropBehavior } from '../../../models/Model';

@Component({
  selector: 'app-table',
  imports: [
    CommonModule,
    InputSearchComponent,
    FormsModule,
    ButtonsFooterComponent,
    ButtonsMenuComponent
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent<T extends ItemRefTableComponent> implements IComponent<TableComponent<T>> {

    static instanceId = 0;
    instanceId = 0;
    @Input() id: number = 0;
    @Input() store = new ComponentStore<T[]>( [], of([]) );
    secondStore = this.store.storeFromThis<T[]>( state => state );
    thirdStore = this.secondStore.storeFromThis<T[]>( state => state );
    data: T[] = [];

    rowIndex = -1;
    cellIndex = -1;
    selectedColumnIndex = -1;
    stateColumn = StateColumnTableComponent.normal;
    selectedItem?: T;

    @Input() vm$ = new BehaviorSubject<TableComponentVm<T>>({
        title: '',
        isHeadActive: true,
        isCloseButtonActive: true,
        stateRow: StateRowTableComponent.select,
        bindingProperties: [],
    });

    @Input() inputSearchComponentVm$ = new BehaviorSubject<InputSearchComponentVm<T>>({
        value2search: '',
        bindingProperties: []
    });

    @Input() buttonsMenuComponentVm$ = new BehaviorSubject<ButtonsMenuComponentVm>({
        buttons: []
    })

    @Input() buttonsFooterComponentVm$ =  new BehaviorSubject<ButtonsFooterComponentVm>({
        buttonsHtml: [],
    });


    // @Input() collectionFilterComponentVm$ = new BehaviorSubject<CollectionFilterComponentVm<T>>({
    //     dataBinding: [],
    //     stateComponent: StateCollectionFilterComponent.once
    // });
    

    sub = new Subscription();
    modalService = inject( ModalService );
    StateRowTableComponent = StateRowTableComponent;
    StateColumnTableComponent = StateColumnTableComponent;
    PropBehavior = PropBehavior;

    recordActions = {
        addItem: {
            title: 'Nuevo',
            onClick: ( e: Event ) => this.addItem( e )
        },
        updateItems: {
            title: 'Actualizar',
            onClick: ( e: Event ) => {

                const prevStateRow = this.vm$.value.stateRow;

                this.vm$.next({
                    ...this.vm$.value,
                    stateRow: StateRowTableComponent.select
                });

                this.buttonsFooterComponentVm$.next({
                    ...this.buttonsFooterComponentVm$.value,
                    buttonsHtml: [
                        {
                            class: BUTTON_CLASS_BOOTSTRAP.secondary,
                            title: 'Cancelar',
                            onClick: e => {

                                this.vm$.next({
                                    ...this.vm$.value,
                                    stateRow: prevStateRow
                                });

                                this.buttonsFooterComponentVm$.next({
                                    ...this.buttonsFooterComponentVm$.value,
                                    buttonsHtml: []
                                });

                                this.store.getRead().subscribe();
                            }
                        },
                        {
                            class: BUTTON_CLASS_BOOTSTRAP.primary,
                            title: 'Confirmar',
                            onClick: e => {

                                this.vm$.next({
                                    ...this.vm$.value,
                                    stateRow: prevStateRow
                                });

                                this.buttonsFooterComponentVm$.next({
                                    ...this.buttonsFooterComponentVm$.value,
                                    buttonsHtml: []
                                });

                                this.onUpdateItems.emit({
                                    event: e,
                                    sender: this,
                                    data: this.data
                                })
                            }
                        },
                    ]
                });
            }
        },
        deleteItems: {
            title: 'Eliminar',
            onClick: ( e: Event ) => {

                const prevStateRow = this.vm$.value.stateRow;

                this.vm$.next({
                    ...this.vm$.value,
                    stateRow: StateRowTableComponent.checkBox
                });

                this.buttonsFooterComponentVm$.next({
                    ...this.buttonsFooterComponentVm$.value,
                    buttonsHtml: [
                        {
                            class: BUTTON_CLASS_BOOTSTRAP.secondary,
                            title: 'Cancelar',
                            onClick: e => {
                                
                                this.vm$.next({
                                    ...this.vm$.value,
                                    stateRow: prevStateRow
                                })
                                
                                this.buttonsFooterComponentVm$.next({
                                    ...this.buttonsFooterComponentVm$.value,
                                    buttonsHtml: []
                                });

                                this.store.getRead().subscribe({
                                    next: s => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = 'Lectura del estado' ),
                                    error: error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error )
                                })
                            }
                        },
                        {
                            class: BUTTON_CLASS_BOOTSTRAP.primary,
                            title: 'Confimar',
                            onClick: e => {

                                this.vm$.next({
                                    ...this.vm$.value,
                                    stateRow: prevStateRow
                                })

                                this.buttonsFooterComponentVm$.next({
                                    ...this.buttonsFooterComponentVm$.value,
                                    buttonsHtml: []
                                });

                                const data = this.getDataChecked();

                                this.onDeleteItems.emit({
                                    event: e,
                                    sender: this,
                                    data: data
                                })
                            }
                        },
                    ]
                });
            }
        },
        filter: {
            title: 'Filtrar',
            onClick: ( e: Event ) => this.openFilter( e )
        },
        import: {
            title: 'Importar',
            onClick: ( e: Event ) => this.importData( e )
        },
        export: {
            title: 'Exportar',
            onClick: ( e: Event ) => this.exportData( e )
        },
    };


    buttonsFooter2RadioButton = () => {
        this.buttonsFooterComponentVm$.next({
            ...this.buttonsFooterComponentVm$.value,
            buttonsHtml: [
                {
                    title: 'Reestablecer',
                    class: BUTTON_CLASS_BOOTSTRAP.secondary,
                    onClick: e => {
                        this.onResetItem.emit({
                            event: e,
                            sender: this,
                            item: undefined
                        });

                        this.close( e );
                    }
                },
                {
                    title: 'Cancelar',
                    class: BUTTON_CLASS_BOOTSTRAP.secondary,
                    onClick: e => this.close( e )
                },
                {
                    title: 'Confirmar',
                    class: BUTTON_CLASS_BOOTSTRAP.primary,
                    onClick: e => {
                        const item = this.getDataChecked()[ 0 ];
                        if ( item )
                            this.onSelectItem.emit({
                                event: e,
                                sender: this,
                                item
                            });

                        this.close( e );
                    }
                },
            ]
        });
    };

    buttonsFooter2CheckBox = () => {
        this.buttonsFooterComponentVm$.next({
            ...this.buttonsFooterComponentVm$.value,
            buttonsHtml: [
                {
                    title: 'Reestablecer',
                    class: BUTTON_CLASS_BOOTSTRAP.secondary,
                    onClick: e => {
                        this.onResetItems.emit({
                            event: e,
                            sender: this,
                            data: []
                        });
                        this.close( e );
                    }
                },
                {
                    title: 'Cancelar',
                    class: BUTTON_CLASS_BOOTSTRAP.secondary,
                    onClick: e => this.close( e )
                },
                {
                    title: 'Confirmar',
                    class: BUTTON_CLASS_BOOTSTRAP.primary,
                    onClick: e => {
                        const data = this.getDataChecked();
                        if ( data.length > 0 )
                            this.onSelectItems.emit({
                                event: e,
                                sender: this,
                                data
                            });

                        this.close( e );
                    }
                },
            ]
        });
    }

    @ViewChild( 'tableBody' ) private tableBody?: ElementRef<HTMLElement>
    private onClickDocument = ( e: Event ) => {
        if ( !this.tableBody?.nativeElement.contains( e.target as HTMLElement ) ) {
            
            this.rowIndex = -1;
            this.cellIndex = -1;
            this.selectedItem = undefined;

        }
    };


    @Output() readonly onInit = new EventEmitter<TableComponent<T>>();
    @Output() readonly onDestroy = new EventEmitter();
    @Output() readonly onClose = new EventEmitter<TableComponentEventData<T>>();

    @Output() readonly onSelectItem = new EventEmitter<TableComponentItemEventData<T>>();
    @Output() readonly onSelectItems = new EventEmitter<TableComponentEventData<T>>();
    @Output() readonly onResetItem = new EventEmitter<TableComponentResetItemEventData<T>>();
    @Output() readonly onResetItems = new EventEmitter<TableComponentResetEventData<T>>();
    @Output() readonly onUpdateItems = new EventEmitter<TableComponentEventData<T>>();
    @Output() readonly onDeleteItems = new EventEmitter<TableComponentEventData<T>>();
    @Output() readonly onAddItem = new EventEmitter<TableComponentEventData<T>>();
    @Output() readonly onReadItems = new EventEmitter<TableComponentEventData<T>>();

    @Output() readonly onImport = new EventEmitter<TableComponentEventData<T>>();
    @Output() readonly onExport = new EventEmitter<TableComponentEventData<T>>();

    // @Output() readonly onFilter = new EventEmitter<TableComponentOnFilterEventData<T>>();
    // @Output() readonly onReset = new EventEmitter<TableComponent_CollectionFilterComponentEventData<T>>();


    constructor()
    {
        TableComponent.instanceId++;
        this.instanceId = TableComponent.instanceId;
    }


    ngOnInit()
    {
        this.onInit.emit( this );

        this.secondStore = this.store.storeFromThis<T[]>( state => state );
        this.thirdStore = this.secondStore.storeFromThis<T[]>( state => state );

        this.sub.add( this.thirdStore.state$.subscribe( data => this.data = data ) );

        this.sub.add( this.thirdStore.error$.subscribe( error => this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error ) ) );

        this.sub.add( this.vm$.subscribe( vm => {

            this.inputSearchComponentVm$.next({
                ...this.inputSearchComponentVm$.value,
                bindingProperties: vm.bindingProperties
            });

            if ( vm.stateRow === StateRowTableComponent.radioButton ) {
                this.buttonsFooter2RadioButton();
            }
            else if ( vm.stateRow === StateRowTableComponent.checkBox ) {
                this.buttonsFooter2CheckBox();
            }

        } ) );

    }


    ngAfterViewInit()
    {
        document.addEventListener( 'click', this.onClickDocument );
    }


    getData(): T[]
    {
        return this.store.getState();
    }


    getDataChecked(): T[]
    {
        return this.store.getState().filter( item => item.isChecked );
    }


    setDataChecked( data: T[] )
    {
        data.forEach( item => {

            const itemSelected = this.store.getState().find( it => it.symbol === item.symbol )
                                ?? this.store.getState().find( it => it.id === item.id );

                                
            if ( itemSelected ) itemSelected.isChecked = true;
            
            console.log( itemSelected, 'data:', this.store.getState())
        } )
    }


    close( e: Event )
    {
        this.modalService.close( this );
        this.onClose.emit({
            event: e,
            sender: this,
            data: this.store.getState()
        });
    }


    searchItem( e: InputSearchComponentEventData<T> )
    {
        this.thirdStore.setState( e.data );
    }


    clickFirstColumnTh( e: Event, inputCheckTh: HTMLInputElement )
    {
        if ( e.target !== inputCheckTh ) inputCheckTh.checked = !inputCheckTh.checked;

        if ( inputCheckTh.checked ) {
            this.data.forEach( item => item.isChecked = true );
        }
        else {
            this.data.forEach( item => item.isChecked = false );
        }
    }


    clickRow( event: Event, selectedItem: T, rowIndex: number )
    {
        
        if ( this.vm$.value.stateRow === StateRowTableComponent.checkBox ) {

            selectedItem.isChecked = !selectedItem.isChecked;

        }
        else if ( this.vm$.value.stateRow === StateRowTableComponent.radioButton ) {

            this.store.getState().forEach( item => item.isChecked = item === selectedItem );

        }


        this.selectedItem = selectedItem;
        this.rowIndex = rowIndex;
        this.cellIndex = -1;


        if ( this.vm$.value.stateRow === StateRowTableComponent.select ) {
            
            this.onSelectItem.emit({
                event: event,
                sender: this,
                item: selectedItem
            });
            
        }

    }


    clickCell( event: Event, rowIndex: number, cellIndex: number, item: T )
    {
        this.selectedItem = item;
        this.rowIndex = rowIndex;
        this.cellIndex = cellIndex;
    }


    readItems( e: Event )
    {
        this.store.getRead().subscribe();
        this.onReadItems.emit({
            event: e,
            sender: this,
            data: this.thirdStore.getState()
        });
    }


    addItem( e: Event )
    {
        this.onAddItem.emit({
            event: e,
            sender: this,
            data: this.store.getState()
        });
    }

    openFilter( e: Event )
    {
        // this.modalService.open( CollectionFilterComponent<T> ).subscribe( c => {

        //     c.store = this.secondStore;
        //     c.vm$ = this.collectionFilterComponentVm$;

        //     c.sub.add( c.onFilter.subscribe( e => this.onFilter.emit({
        //         eventData: e,
        //         sender: this,
        //         data: this.store.getState()
        //     }) ) );

        //     c.sub.add( c.onReset.subscribe( e => this.onReset.emit({
        //         eventData: e,
        //         sender: this,
        //         data: this.store.getState()
        //     }) ) )

        // } );
    }


    importData( e: Event )
    {
        this.onImport.emit({
            event: e,
            sender: this,
            data: this.thirdStore.getState()
        });
    }


    exportData( e: Event )
    {
        // try {
        //     const data = this.thirdStore.getState();
        //     const csv = json2csv( data as object[] );
        //     const blob = new Blob( [ csv ], { type: 'text/csv;charset=utf-8' } );
        //     const url = URL.createObjectURL( blob );

        //     const link = document.createElement( 'a' );
        //     const datetime = Prop.setDateTime( Date() )?.replaceAll( ' ', '_' ) ?? '';
        //     const fileName = datetime + `_${ ( `data_${this.vm$.value.title}` ).replace( ' ', '-' ) }.csv`;

        //     link.href = url;
        //     link.download = fileName;
        //     link.style.display = 'none';
        //     document.body.appendChild( link );
        //     link.click();
        //     document.body.removeChild( link );

        // }
        // catch ( error: any ) {
        //     this.modalService.open( MessageBoxComponent ).subscribe( c => c.mensaje = error );
        //     return;
        // }

        // this.onExport.emit({
        //     event: e,
        //     sender: this,
        //     data: this.thirdStore.getState()
        // });
    }


    sortColumn( e: Event, bind: BindingPropertyTableComponent<T>, i: number )
    {
        if ( this.selectedColumnIndex !== i ) {
            this.selectedColumnIndex = i;
            this.stateColumn = StateColumnTableComponent.normal;
        }

        if ( this.stateColumn === StateColumnTableComponent.normal ) {
            

            // this.data = Enumerable.from( this.store.getState() )
            //                     .orderBy( item => bind.getValue( item ) )
            //                     .toArray();
            
            this.selectedColumnIndex = i;
            this.stateColumn = StateColumnTableComponent.ascending;

        }
        else if ( this.stateColumn === StateColumnTableComponent.ascending ) {

            // this.data = Enumerable.from( this.store.getState() )
            //                         .orderByDescending( item => bind.getValue( item ) )
            //                         .toArray();

            this.selectedColumnIndex = i;
            this.stateColumn = StateColumnTableComponent.descending;

        }
        else if ( this.stateColumn === StateColumnTableComponent.descending ) {
            
            this.data = this.store.getState();

            this.selectedColumnIndex = i;
            this.stateColumn = StateColumnTableComponent.normal;
             
        }
    }


    ngOnDestroy()
    {
        this.onDestroy.emit( this );
        this.sub.unsubscribe();
        this.store.complete();
        this.secondStore.complete();
        this.thirdStore.complete();
        document.removeEventListener( 'click', this.onClickDocument );
        console.log( 'TableComponent', this.instanceId, 'destruido' );
    }
}

export type TableComponentEventData<T extends ItemType> = {
    event: Event,
    sender: TableComponent<T>,
    data: T[]
}

export type TableComponentItemEventData<T extends ItemType> = {
    event: Event,
    sender: TableComponent<T>,
    item: T
}

export type TableComponentResetItemEventData<T extends ItemType> = {
    event: Event,
    sender: TableComponent<T>,
    item: undefined
}

export type TableComponentResetEventData<T extends ItemType> = {
    event: Event,
    sender: TableComponent<T>,
    data: []
}

// export type TableComponentOnFilterEventData<T extends ItemType> = {
//     eventData: CollectionFilterComponentOnFilterEventData<T>,
//     sender: TableComponent<T>,
//     data: T[]
// }

// export type TableComponent_CollectionFilterComponentEventData<T extends ItemType> = {
//     eventData: CollectionFilterComponentEventData<T>,
//     sender: TableComponent<T>,
//     data: T[]
// }

export enum StateRowTableComponent
{
    none,
    select,
    checkBox,
    radioButton,
}

export enum StateColumnTableComponent
{
    normal,
    ascending,
    descending
}

export interface BindingPropertyTableComponent<T extends ItemType>
{
    title: string,
    getValue: ( item: T ) => T[keyof T] | undefined,
    behavior: PropBehavior
}

export type ItemRefTableComponent = ItemType &
{
    isChecked?: boolean
}

export interface TableComponentVm<T extends ItemType>
{
    title: string,
    isHeadActive: boolean,
    isCloseButtonActive: boolean,
    stateRow: StateRowTableComponent,
    bindingProperties: BindingPropertyTableComponent<T>[]
}