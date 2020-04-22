// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as debug_ from "debug";
import { error } from "readium-desktop/common/error";
import { winActions } from "readium-desktop/main/redux/actions";
import { eventChannel } from "redux-saga";
import { all, debounce, put, take, takeLeading } from "redux-saga/effects";

// Logger
const filename_ = "readium-desktop:main:redux:sagas:win:session:library";
const debug = debug_(filename_);
debug("_");

function* libraryClosed(action: winActions.session.registerLibrary.TAction) {

    const library = action.payload.win;
    const channel = eventChannel<boolean>(
        (emit) => {

            const handler = (event: Electron.Event) => {
                event.preventDefault();
                emit(true);
            };
            library.on("close", handler);

            return () => {
                library.removeListener("close", handler);
            };
        },
    );

    yield take(channel);
    yield put(winActions.session.unregisterLibrary.build());
    yield put(winActions.library.closed.build());
}

function* libraryMovedOrResized(action: winActions.session.registerLibrary.TAction) {

    const library = action.payload.win;
    const id = action.payload.identifier;
    const DEBOUNCE_TIME = 500;

    const channel = eventChannel<boolean>(
        (emit) => {

            const handler = () => emit(true);

            library.on("move", handler);
            library.on("resize", handler);

            return () => {
                library.removeListener("move", handler);
                library.removeListener("resize", handler);
            };
        },
    );

    yield debounce(DEBOUNCE_TIME, channel, function*() {

        const winBound = library.getBounds();
        yield put(winActions.session.setBound.build(id, winBound));
    });
}

export function* watchers() {

    try {

        yield all([
            takeLeading(winActions.session.registerLibrary.ID, libraryClosed),
            takeLeading(winActions.session.registerLibrary.ID, libraryMovedOrResized),
        ]);
    } catch (err) {
        error(filename_, err);
    }
}