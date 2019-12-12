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

import * as $Dgram from "dgram";
import * as $Events from "@litert/events";
import * as C from "./Common";
import * as E from "./Errors";

interface IHost {

    socket: $Dgram.Socket;

    address: C.IAddress;
}

class UDPHost extends $Events.EventEmitter<C.IHostEvents> implements C.IHost {

    private _hosts: Record<string, IHost> = {};

    public constructor(
        // @ts-ignore
        private _handler: C.THandler
    ) {

        super();
    }

    public get listenedAddress(): C.IAddress[] {

        return Object.values(this._hosts).map((v) => ({
            ...v.address
        }));
    }

    public setHandler(handler: C.THandler): this {

        this._handler = handler;

        return this;
    }

    private _createGateway(hostname: string, port: number, type: C.EAddrType, alias: string) {

        return (new Function("host", "errors", `return function(data, rinfo) {

            host._handler(
                data,
                {
                    "peer": {
                        "name": "",
                        "port": rinfo.port,
                        "hostname": rinfo.address,
                        "type": rinfo.family === "IPv4" ? ${C.EAddrType.IPV4} : ${C.EAddrType.IPV6}
                    },
                    "self": {
                        "name": ${JSON.stringify(alias)},
                        "port": ${port},
                        "hostname": ${JSON.stringify(hostname)},
                        "type": ${type}
                    },
                    reply(data) {
                        return host.send(data, rinfo.address, rinfo.port, ${JSON.stringify(alias)});
                    },
                    send(data, hostname, port) {
                        return host.send(data, hostname, port, ${JSON.stringify(alias)});
                    },
                    host
                }
            ).catch(
                (e) => host.emit("error", new E.E_HANDLER_ERROR({ "metadata": { "origin": e } }))
            );

        }`))(this, E);
    }

    public listenV4(hostname: string, port: number, alias: string = `${hostname}:${port}`): Promise<string> {

        if (this._hosts[alias]) {

            const h = this._hosts[alias].address;

            if (h.hostname !== hostname || h.port !== port || h.type !== C.EAddrType.IPV4) {

                return Promise.reject(new E.E_DUP_HOST());
            }

            return Promise.resolve(alias);
        }

        return new Promise<string>((resolve, reject) => {

            const sock = $Dgram.createSocket(
                "udp4",
                this._createGateway(hostname, port, C.EAddrType.IPV4, alias)
            );

            sock.on("error", function(e: any) {

                if (e.code === "EADDRINUSE") {

                    return reject(new E.E_DUP_HOST({ metadata: { hostname, port, type: C.EAddrType.IPV4 } }));
                }

                reject(new E.E_CANNOT_LISTEN({ metadata: { origin: e } }));
            });

            sock.bind(port, hostname, () => {

                this._hosts[alias] = {
                    socket: sock,
                    address: {

                        name: alias,
                        port,
                        hostname,
                        type: C.EAddrType.IPV4
                    }
                };

                sock.removeAllListeners("error");
                sock.on("error", (e) => this.emit("error", e));
                resolve(alias);
            });
        });
    }

    public listenV6(hostname: string, port: number, alias: string = `${hostname}:${port}`): Promise<string> {

        if (this._hosts[alias]) {

            const h = this._hosts[alias].address;

            if (h.hostname !== hostname || h.port !== port || h.type !== C.EAddrType.IPV6) {

                return Promise.reject(new E.E_DUP_HOST());
            }

            return Promise.resolve(alias);
        }

        return new Promise<string>((resolve, reject) => {

            const sock = $Dgram.createSocket(
                "udp6",
                this._createGateway(hostname, port, C.EAddrType.IPV6, alias)
            );

            sock.on("error", function(e: any) {

                if (e.code === "EADDRINUSE") {

                    return reject(new E.E_DUP_HOST({ metadata: { hostname, port, type: C.EAddrType.IPV6 } }));
                }

                reject(new E.E_CANNOT_LISTEN({ metadata: { origin: e } }));
            });

            sock.bind(port, hostname, () => {

                this._hosts[alias] = {
                    socket: sock,
                    address: {

                        name: alias,
                        port,
                        hostname,
                        type: C.EAddrType.IPV6
                    }
                };

                sock.removeAllListeners("error");
                sock.on("error", (e) => this.emit("error", e));
                resolve(alias);
            });
        });
    }

    public async unlisten(hostname: string, port?: number): Promise<void> {

        let name = port ? `${hostname}:${port}` : hostname;

        if (!this._hosts[name]) {

            throw new E.E_NO_HOST();
        }

        const ret = new Promise<void>((resolve) => this._hosts[name].socket.close(resolve));

        delete this._hosts[name];

        return ret;
    }

    public async unlistenAll(): Promise<void> {

        await Promise.all(Object.values(this._hosts).map((v) => this.unlisten(v.address.name)));
    }

    public async send(data: Buffer | string, hostname: string, port: number, from: string): Promise<number> {

        if (!this._hosts[from]) {

            return 0;
        }

        return new Promise<number>((resolve, reject) => {

            this._hosts[from].socket.send(data, port, hostname, function(e, l) {

                if (e) {

                    return reject(new E.E_CANNOT_SEND({ metadata: { origin: e } }));
                }

                resolve(l);
            });
        });
    }
}

export function createHost(handler: C.THandler): C.IHost {

    return new UDPHost(handler);
}
