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

// tslint:disable: no-console
import $Loggers from "@litert/logger";
import * as L from "@litert/core";
import * as $UDP from "../lib";

$Loggers.unmute();

const srvLogs = $Loggers.createTextLogger("UDP Server");

const server = $UDP.createHost(async function(data, ctx) {

    const self = `${ctx.self.hostname}:${ctx.self.port}`;

    const peer = `${ctx.peer.hostname}:${ctx.peer.port}`;

    srvLogs.info(`${self} recieved "${data.toString()}" from ${peer}.`);

    srvLogs.info(`${self} sent ${await ctx.reply("PONG")} bytes to ${peer}.`);

    srvLogs.info(`${self} sent extra ${await ctx.send("PONG", ctx.peer.hostname, ctx.peer.port)} bytes to ${peer}.`);
});

const cliLogs = $Loggers.createTextLogger("UDP Client");

const client = $UDP.createHost(async function(data, ctx) {

    const self = `${ctx.self.hostname}:${ctx.self.port}`;

    const peer = `${ctx.peer.hostname}:${ctx.peer.port}`;

    cliLogs.info(`${self} recieved "${data.toString()}" from ${peer}.`);
});

const SERVER_ADDR = "127.0.0.1";
const SERVER_PORT_1 = 9000;
const SERVER_PORT_2 = 9001;

const CLIENT_ADDR = "127.0.0.1";
const CLIENT_PORT_1 = 21000;
const CLIENT_PORT_2 = 21001;

(async () => {

    try {

        const SERVER_NAME_1 = await server.listenV4(SERVER_ADDR, SERVER_PORT_1);

        srvLogs.info(`Started as ${SERVER_NAME_1}.`);

        const SERVER_NAME_2 = await server.listenV4(SERVER_ADDR, SERVER_PORT_2);

        srvLogs.info(`Started as ${SERVER_NAME_2}.`);

        const CLIENT_NAME_1 = await client.listenV4(CLIENT_ADDR, CLIENT_PORT_1);

        cliLogs.info(`Started as ${CLIENT_NAME_1}.`);

        const CLIENT_NAME_2 = await client.listenV4(CLIENT_ADDR, CLIENT_PORT_2);

        cliLogs.info(`Started as ${CLIENT_NAME_2}.`);

        while (1) {

            const srvPort = Math.random() < 0.5 ? SERVER_PORT_1 : SERVER_PORT_2;

            const cli = Math.random() < 0.5 ? CLIENT_NAME_1 : CLIENT_NAME_2;

            cliLogs.info(`${cli} sent ${await client.send(
                "PING",
                SERVER_ADDR,
                srvPort,
                cli
            )} bytes to ${SERVER_ADDR}:${srvPort}.`);

            await L.Async.sleep(3000);
        }
    }
    catch (e) {

        console.error(e);
    }

})();
