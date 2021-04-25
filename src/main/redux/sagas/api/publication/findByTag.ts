// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { call as callTyped } from "typed-redux-saga/macro";
import { diMainGet } from "readium-desktop/main/di";
import { aboutFiltered } from "readium-desktop/main/filter";
import { PublicationDocument } from "readium-desktop/main/db/document/publication";
import { PublicationViewConverter } from "readium-desktop/main/converter/publication";

const convertDocs = async (docs: PublicationDocument[], publicationViewConverter: PublicationViewConverter) => {
    const pubs = [];
    for (const doc of docs) {
        pubs.push(await publicationViewConverter.convertDocumentToView(doc));
    }
    return pubs;
};
export function* findByTag(tag: string) {

    const publicationRepository = diMainGet("publication-repository");
    const publicationViewConverter = diMainGet("publication-view-converter");
    const docs = yield* callTyped(() => publicationRepository.findByTag(tag));
    const publicationViews = yield* callTyped(() => convertDocs(docs, publicationViewConverter));

    return aboutFiltered(publicationViews);
}
