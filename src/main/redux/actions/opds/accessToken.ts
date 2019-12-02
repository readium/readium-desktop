// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { Action } from "readium-desktop/common/models/redux";

export const ID = "OPDS_ACCESS_TOKEN";

export interface Payload {
    domain: string;
    accessToken: string;
}

export function build(domain: string, accessToken: string):
    Action<typeof ID, Payload> {

    return {
        type: ID,
        payload: {
            domain,
            accessToken,
        },
    };
}
build.toString = () => ID; // Redux StringableActionCreator
export type TAction = ReturnType<typeof build>;
