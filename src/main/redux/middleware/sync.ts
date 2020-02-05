// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as debug_ from "debug";
import { syncIpc } from "readium-desktop/common/ipc";
import { ActionWithSender, SenderType } from "readium-desktop/common/models/sync";
import {
    apiActions, dialogActions, downloadActions, i18nActions, lcpActions, readerActions,
    toastActions,
} from "readium-desktop/common/redux/actions";
import { diMainGet, getLibraryWindowFromDi, getReaderWindowFromDi } from "readium-desktop/main/di";
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from "redux";

import { RootState } from "../states";

const debug = debug_("readium-desktop:sync");

// Actions that can be synchronized
const SYNCHRONIZABLE_ACTIONS: string[] = [
    apiActions.result.ID,

    // netActions.offline.ID,
    // netActions.online.ID,

    dialogActions.openRequest.ID,

    readerActions.openError.ID,
    readerActions.closeError.ID,
    readerActions.closeSuccess.ID,

    readerActions.detachModeSuccess.ID,

    readerActions.configSetDefault.ID,
    readerActions.configSetResetDefault.ID,

    // readerActions.saveBookmarkError.ID,
    // readerActions.saveBookmarkSuccess.ID,

    readerActions.fullScreenRequest.ID,

    lcpActions.userKeyCheckRequest.ID,

    i18nActions.setLocale.ID,

    // updateActions.latestVersion.ID,

    toastActions.openRequest.ID,
    toastActions.closeRequest.ID,

    downloadActions.request.ID,
    downloadActions.progress.ID,
    downloadActions.success.ID,
    downloadActions.error.ID,
];

export const reduxSyncMiddleware: Middleware
    = (store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) =>
        (next: Dispatch<ActionWithSender>) =>
            ((action: ActionWithSender) => {

                debug("### action type", action.type);

                // Test if the action must be sent to the rendeder processes
                if (SYNCHRONIZABLE_ACTIONS.indexOf(action.type) === -1) {
                    // Do not send
                    return next(action);
                }

                // Send this action to all the registered renderer processes

                // actually when a renderer process send an api action this middleware broadcast to all renderer
                // It should rather keep the action and don't broadcast an api request between front and back
                // this bug become a feature with a hack in publicationInfo in reader
                // thanks to this broadcast we can listen on publication tag and make a live refresh

                // Get action serializer
                const actionSerializer = diMainGet("action-serializer");

                const browserWin: Map<string, Electron.BrowserWindow> = new Map();

                const libId = store.getState().win.session.library.identifier;
                try {
                    const libWin = getLibraryWindowFromDi();
                    browserWin.set(libId, libWin);
                } catch (_err) {
                    // ignore
                    // library window may be not initialized in first
                }

                const readers = store.getState().win.session.reader;
                for (const key in readers) {
                    if (readers[key]) {
                        try {
                            const readerWin = getReaderWindowFromDi(readers[key].identifier);
                            browserWin.set(readers[key].identifier, readerWin);
                        } catch (_err) {
                            // ignore
                        }
                    }
                }

                browserWin.forEach(
                    (win, id) => {
                        if (
                            !(
                                action.sender?.type === SenderType.Renderer
                                && action.sender?.identifier === id
                            )
                        ) {

                            try {
                                win.webContents.send(syncIpc.CHANNEL, {
                                    type: syncIpc.EventType.MainAction,
                                    payload: {
                                        action: actionSerializer.serialize(action),
                                    },
                                    sender: {
                                        type: SenderType.Main,
                                    },
                                } as syncIpc.EventPayload);

                            } catch (error) {
                                debug("ERROR in SYNC ACTION", error);
                            }
                        }
                    });

                // for (const readerWindow of readerWindows) {
                //     // Notifies renderer process
                //     const winId = readerWindow.id;

                //     if (action.sender &&
                //         action.sender.type === SenderType.Renderer &&
                //         action.sender.identifier === identifier
                //     ) {
                //         // Do not send in loop an action already sent by this renderer process
                //         continue;
                //     }

                //     try {
                //         appWindow.browserWindow.webContents.send(syncIpc.CHANNEL, {
                //             type: syncIpc.EventType.MainAction,
                //             payload: {
                //                 action: actionSerializer.serialize(action),
                //             },
                //             sender: {
                //                 type: SenderType.Main,
                //             },
                //         } as syncIpc.EventPayload);
                //     } catch (error) {
                //         console.error("Windows does not exist", winId);
                //     }
                // }

                return next(action);
            });
