import { inject, Injectable } from '@angular/core';
import { ModalService } from './modal.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize, Observable, switchMap, tap, throwError } from 'rxjs';
import { LoaderComponent } from '../views/Components/loader/loader.component';


@Injectable({
  providedIn: 'root'
})
export class HttpService {

    modalService = inject( ModalService );
    httpClient = inject( HttpClient );
    url = "http://localhost:3000/api";


    get<T>( service: string ): Observable<T>
    {
        return this.modalService.open( LoaderComponent, true ).pipe(
            switchMap( l => {

                return this.httpClient.get<T>( `${this.url}/${service}` )
                .pipe(
                    tap( data => console.log( 'response', data ) ),
                    catchError( error => {
                        console.log( error );
                        return throwError( () => error.statusText ?? error.message );
                    } ),
                    finalize( () => this.modalService.close( l ) ),
                );

            } )
        );
    }


    getById<T>( body: {
        service: string,
        id?: number
    } ): Observable<T>
    {
        return this.modalService.open( LoaderComponent, true ).pipe(
            switchMap( l => {

                return this.httpClient.get<T>( `${this.url}/${body.service}/${body.id}` )
                .pipe(
                    tap( data => console.log( 'response', data ) ),
                    catchError( error => {
                        console.log( error );
                        return throwError( () => error.statusText ?? error.message );
                    } ),
                    finalize( () => this.modalService.close( l ) ),
                );

            } )
        );
    }


    post<T>( body: HttpBody ): Observable<T>
    {
        return this.modalService.open( LoaderComponent, true ).pipe(
            switchMap( l => {

                const headers = new HttpHeaders({
                    'Content-Type': 'application/json'
                });

                console.log( 'request', body )
        
                return this.httpClient.post<T>( `${this.url}/${body.service}`, body.values, {
                    headers,
                    withCredentials: true
                } )
                .pipe(
                    tap( data => console.log( 'response', data ) ),
                    catchError( error => {
                        console.log( error );
                        return throwError( () => error.statusText ?? error.message );
                    } ),
                    finalize( () => this.modalService.close( l ) ),
                );

            } )
        )        
    }


    put<T>( body: HttpBody ): Observable<T>
    {
        return this.modalService.open( LoaderComponent, true ).pipe(
            switchMap( l => {

                const headers = new HttpHeaders({
                    'Content-Type': 'application/json'
                });

                console.log( 'request', body )
        
                return this.httpClient.put<T>( `${this.url}/${body.service}`, body.values, {
                    headers,
                    withCredentials: true
                } )
                .pipe(
                    tap( data => console.log( 'response', data ) ),
                    catchError( error => {
                        console.log( error );
                        return throwError( () => error.statusText ?? error.message );
                    } ),
                    finalize( () => this.modalService.close( l ) ),
                );

            } )
        )        
    }


    delete<T>( body: {
        service: string,
        id?: number
    } ): Observable<T>
    {
        return this.modalService.open( LoaderComponent, true ).pipe(
            switchMap( l => {

                console.log( 'request', body )
        
                return this.httpClient.delete<T>( `${this.url}/${body.service}/${body.id}`)
                .pipe(
                    tap( data => console.log( 'response', data ) ),
                    catchError( error => {
                        console.log( error );
                        return throwError( () => error.statusText ?? error.message );
                    } ),
                    finalize( () => this.modalService.close( l ) ),
                );

            } )
        )        
    }
}


export interface HttpBody
{
    service: string,
    values?: Record<string,any>
}


export interface HttpError
{
    error: string,
    message: string,
    statusCode: number
}


export interface HttpResult
{
    affectedRows: number
}