// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { Action } from "readium-desktop/common/models/redux";

export const ID = "STREAMER_START_SUCCESS";

export interface Payload {
    streamerUrl: string;
}
export function build(streamerUrl: string):
    Action<typeof ID, Payload> {

    return {
        type: ID,
        payload: {
            streamerUrl,
        },
    };
}
build.toString = () => ID; // Redux StringableActionCreator
