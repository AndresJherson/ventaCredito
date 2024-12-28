import { EventEmitter, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

export interface IComponent<T extends Object = Object> extends OnInit, OnDestroy
{
    readonly onInit: EventEmitter<T>;
    readonly onDestroy: EventEmitter<T>;
    readonly sub: Subscription;
}