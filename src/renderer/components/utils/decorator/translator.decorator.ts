// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "React";
import { Translator } from "readium-desktop/common/services/translator";
import { TranslatorContext } from "readium-desktop/renderer/components/App";

import { ReactBaseComponent } from "../ReactBaseComponent";

export function translatorDecorator<
    // tslint:disable-next-line:callable-types
    T extends { new(...args: any[]): ReactBaseComponent<P, S, ReduxState, ReduxDispatch> },
    P = {},
    S = {},
    ReduxState = {},
    ReduxDispatch = {},
    >(component: T) {
    return class TranslatorDecorator extends component {

        public render() {

            return React.createElement(
                TranslatorContext.Consumer,
                null,
                (translator: Translator) => {
                    this.__ = translator.translate;
                    return super.render();
                },
            );
        }
    };
}
