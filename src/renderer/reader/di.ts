// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import "reflect-metadata";

import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";
import { Translator } from "readium-desktop/common/services/translator";
import { initStore } from "readium-desktop/renderer/reader/redux/store/memory";
import { Store } from "redux";

import App from "./components/App";
import { diReaderSymbolTable as diSymbolTable } from "./diSymbolTable";
import { TRootState } from "./redux/reducers";

// Create container used for dependency injection
const container = new Container();

const store = initStore();
container.bind<Store<TRootState>>(diSymbolTable.store).toConstantValue(store);

// Create translator
const translator = new Translator();
container.bind<Translator>(diSymbolTable.translator).toConstantValue(translator);

container.bind<typeof App>(diSymbolTable["react-app"]).toConstantValue(App);

// local interface to force type return
interface IGet {
    (s: "store"): Store<TRootState>;
    (s: "translator"): Translator;
    (s: "react-app"): typeof App;
}

// export function to get back depedency from container
// the type any for container.get is overloaded by IGet
const diGet: IGet = (symbol: keyof typeof diSymbolTable) => container.get<any>(diSymbolTable[symbol]);

const {
    lazyInject,
    lazyInjectNamed,
    lazyInjectTagged,
    lazyMultiInject,
} = getDecorators(container);

export {
    diGet as diReaderGet,
    lazyInject,
    lazyInjectNamed,
    lazyInjectTagged,
    lazyMultiInject,
};
