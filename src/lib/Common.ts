/**
 * Copyright 2019 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// tslint:disable: unified-signatures
import * as $Events from "@litert/events";

export enum EAddrType {

    IPV4,
    IPV6
}

export interface IAddress {

    name: string;

    hostname: string;

    port: number;

    type: EAddrType;
}

export interface IContext {

    readonly peer: Readonly<IAddress>;

    readonly self: Readonly<IAddress>;

    readonly host: IHost;

    reply(data: Buffer | string): Promise<number>;

    send(data: Buffer | string, hostname: string, port: number): Promise<number>;
}

export type THandler = (packet: Buffer, ctx: IContext) => Promise<void>;

export type IHostEvents = $Events.ICallbackDefinitions;

export interface IHost extends $Events.EventEmitter<IHostEvents> {

    readonly listenedAddress: readonly IAddress[];

    listenV4(hostname: string, port: number, aliasName?: string): Promise<string>;

    listenV6(hostname: string, port: number, aliasName?: string): Promise<string>;

    unlisten(aliasName: string): Promise<void>;

    unlisten(hostname: string, port: number): Promise<void>;

    unlistenAll(): Promise<void>;

    setHandler(handler: THandler): this;

    send(data: Buffer | string, hostname: string, port: number, from: string): Promise<number>;
}
