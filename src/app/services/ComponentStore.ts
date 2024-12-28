import { BehaviorSubject, catchError, EMPTY, map, Observable, Subject, tap } from "rxjs";

export class ComponentStore<T extends Object>
{
    private storeData$: BehaviorSubject<T>;
    public readonly state$: Observable<T>;

    private storeError$ = new Subject<string>();
    public readonly error$ = this.storeError$.asObservable();

    private read$: Observable<T>;


    constructor( initialState: T, read$: Observable<T> | ( () => T ) )
    {
        this.storeData$ = new BehaviorSubject( initialState );
        this.state$ = this.storeData$.asObservable();
        this.read$ = read$ instanceof Observable
                    ? read$
                    : new Observable( o => {
                        try {
                            o.next( read$() );
                            o.complete();
                        }
                        catch ( error ) {
                            o.error( error );
                        }
                    } )
    }


    public getState(): T
    {
        return this.storeData$.value;
    }
    
    
    public getRead(): Observable<void>
    {
        return this.read$.pipe(
            tap( state => this.storeData$.next( state ) ),
            catchError( error => {
                this.storeError$.next( error );
                return error;
            } ),
            map( () => void 0 )
        );
    }


    public setRead( read$: Observable<T> | ( () => T ) ): ComponentStore<T>
    {
        this.read$ = read$ instanceof Observable
                    ? read$
                    : new Observable( o => {
                        try {
                            o.next( read$() );
                            o.complete();
                        }
                        catch ( error ) {
                            o.error( error );
                        }
                    } )

        return this;
    }


    complete(): void
    {
        this.read$ = EMPTY;
        this.storeData$.complete();
        this.storeError$.complete();
    }


    setState( newState: T ): void
    setState( newStateFn: ( state: T ) => T ): void
    setState( newStateOrFn: ( ( state: T ) => T ) | T ): void
    {
        let newState;
        if ( newStateOrFn instanceof Function ) {
            newState = newStateOrFn( this.storeData$.value );
        }
        else {
            newState = newStateOrFn;
        }

        this.storeData$.next( newState );
    }


    storeFromThis<K extends Object>( selectMapper: ( state: T ) => K ): ComponentStore<K>
    {
        const initialState = selectMapper( this.storeData$.value );
        
        const childStore = new ComponentStore<K>( initialState, () => selectMapper( this.storeData$.value ) );
        
        const s = this.state$.subscribe({
            next: state => childStore.getRead().subscribe(),
            error: error => {
                childStore.storeData$.error( error );
                setTimeout( () => s.unsubscribe(), 0 )
            },
            complete: () => {
                childStore.storeData$.complete();
                setTimeout( () => s.unsubscribe(), 0 )
            }
        });

        const errorSub = this.error$.subscribe({
            next: message => childStore.storeError$.next( message ),
            error: error => {
                childStore.storeError$.error( error );
                setTimeout( () => errorSub.unsubscribe(), 0 )
            },
            complete: () => {
                childStore.storeError$.complete();
                setTimeout( () => errorSub.unsubscribe(), 0 )
            }
        });

        return childStore;
    }


    storeFromThisAsync<K extends Object>( initialState: K, read$: Observable<K> ): ComponentStore<K>
    {
        const childStore = new ComponentStore<K>( initialState, read$ );

        const s = this.state$.subscribe({
            next: state => childStore.getRead().subscribe(),
            error: error => {
                childStore.storeData$.error( error );
                setTimeout( () => s.unsubscribe(), 0 );
            },
            complete: () => {
                childStore.storeData$.complete();
                setTimeout( () => s.unsubscribe(), 0 );
            }
        });

        const errorSub = this.error$.subscribe({
            next: message => childStore.storeError$.next( message ),
            error: error => {
                childStore.storeError$.error( error );
                setTimeout( () => errorSub.unsubscribe(), 0 )
            },
            complete: () => {
                childStore.storeError$.complete();
                setTimeout( () => errorSub.unsubscribe(), 0 )
            }
        });

        return childStore;
    }


    subscribeFromStore<K extends Object>( parentStore: ComponentStore<K>, selectMapper: ( state: K ) => T )
    {
        this.setRead( () => selectMapper( parentStore.storeData$.value ) );

        const s = parentStore.state$.subscribe({
            next: state => this.getRead().subscribe(),
            error: error => {
                this.storeData$.error( error );
                setTimeout( () => s.unsubscribe(), 0 )
            },
            complete: () => {
                this.storeData$.complete();
                setTimeout( () => s.unsubscribe(), 0 );
            }
        });

        const errorSub = parentStore.error$.subscribe({
            next: message => this.storeError$.next( message ),
            error: error => {
                this.storeError$.error( error );
                setTimeout( () => errorSub.unsubscribe(), 0 )
            },
            complete: () => {
                this.storeError$.complete();
                setTimeout( () => errorSub.unsubscribe(), 0 )
            }
        });

        return this;
    }


    emitToStore<K extends Object>( childStore: ComponentStore<K>, selectMapper: ( state: T ) => K )
    {
        childStore.setRead( () => selectMapper( this.storeData$.value ) );

        const s = this.state$.subscribe({
            next: state => childStore.getRead().subscribe(),
            error: error => {
                childStore.storeData$.error( error );
                setTimeout( () => s.unsubscribe(), 0 )
            },
            complete: () => {
                childStore.storeData$.complete();
                setTimeout( () => s.unsubscribe(), 0 )
            }
        });

        const errorSub = this.error$.subscribe({
            next: message => childStore.storeError$.next( message ),
            error: error => {
                childStore.storeError$.error( error );
                setTimeout( () => errorSub.unsubscribe(), 0 )
            },
            complete: () => {
                childStore.storeError$.complete();
                setTimeout( () => errorSub.unsubscribe(), 0 )
            }
        });

        return this;
    }
}