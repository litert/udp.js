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
import * as L from "@litert/core";

export const ErrorHub = L.createErrorHub("@litert/udp");

export const E_NO_HOST = ErrorHub.define(
    null,
    "E_NO_HOST",
    "The name of host doesn't exist.",
    {}
);

export const E_DUP_HOST = ErrorHub.define(
    null,
    "E_DUP_HOST",
    "The port of host has been used.",
    {}
);

export const E_CANNOT_SEND = ErrorHub.define(
    null,
    "E_CANNOT_SEND",
    "Failed to deliver a packet.",
    {}
);

export const E_CANNOT_LISTEN = ErrorHub.define(
    null,
    "E_CANNOT_LISTEN",
    "Failed to listen on a port.",
    {}
);

export const E_HANDLER_ERROR = ErrorHub.define(
    null,
    "E_HANDLER_ERROR",
    "Something wrong insides the handler.",
    {}
);
