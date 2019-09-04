// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as debug_ from "debug";
import { inject, injectable } from "inversify";
import { OpdsFeed } from "readium-desktop/common/models/opds";
import { httpGet } from "readium-desktop/common/utils/http";
import { OpdsFeedView, THttpGetOpdsResultView } from "readium-desktop/common/views/opds";
import { OpdsFeedViewConverter } from "readium-desktop/main/converter/opds";
import { OpdsFeedRepository } from "readium-desktop/main/db/repository/opds";
import { diSymbolTable } from "readium-desktop/main/di";
import { JSON as TAJSON } from "ta-json-x";
import * as xmldom from "xmldom";

import { convertOpds1ToOpds2 } from "@r2-opds-js/opds/converter";
import { OPDS } from "@r2-opds-js/opds/opds1/opds";
import { OPDSFeed } from "@r2-opds-js/opds/opds2/opds2";
import { XML } from "@r2-utils-js/_utils/xml-js-mapper";

// Logger
const debug = debug_("readium-desktop:src/main/api/opds");

export interface IOpdsApi {
    getFeed: (identifier: string) => Promise<OpdsFeedView> | void;
    deleteFeed: (identifier: string) => Promise<void> | void;
    findAllFeeds: () => Promise<OpdsFeedView[]> | void;
    addFeed: (data: OpdsFeed) => Promise<OpdsFeedView> | void;
    updateFeed: (data: OpdsFeed) => Promise<OpdsFeedView> | void;
    browse: (url: string) => Promise<THttpGetOpdsResultView> | void;
}

export type TOpdsGetFeedApi = IOpdsApi["getFeed"];
export type TOpdsDeleteFeedApi = IOpdsApi["deleteFeed"];
export type TOpdsFindAllFeedApi = IOpdsApi["findAllFeeds"];
export type TOpdsAddFeedApi = IOpdsApi["addFeed"];
export type TOpdsUpdateFeedApi = IOpdsApi["updateFeed"];
export type TOpdsBrowseApi = IOpdsApi["browse"];

export type TOpdsGetFeedApi_result = OpdsFeedView;
export type TOpdsDeleteFeedApi_result = void;
export type TOpdsFindAllFeedApi_result = OpdsFeedView[];
export type TOpdsAddFeedApi_result = OpdsFeedView;
export type TOpdsUpdateFeedApi_result = OpdsFeedView;
export type TOpdsBrowseApi_result = THttpGetOpdsResultView;

@injectable()
export class OpdsApi implements IOpdsApi {

    /**
     * test all possible content-type for both xml and json
     * @param contentType content-type headers
     * @returns if content-Type is missing accept
     */
    public static contentTypeisAccepted(contentType?: string) {
        const retBool = contentType &&
            !contentType.startsWith("application/json") &&
            !contentType.startsWith("application/opds+json") &&
            !contentType.startsWith("application/atom+xml") &&
            !contentType.startsWith("application/xml") &&
            !contentType.startsWith("text/xml");
        return !retBool;
    }

    @inject(diSymbolTable["opds-feed-repository"])
    private readonly opdsFeedRepository!: OpdsFeedRepository;

    @inject(diSymbolTable["opds-feed-view-converter"])
    private readonly opdsFeedViewConverter!: OpdsFeedViewConverter;

    public async getFeed(identifier: string): Promise<OpdsFeedView> {
        const doc = await this.opdsFeedRepository.get(identifier);
        return this.opdsFeedViewConverter.convertDocumentToView(doc);
    }

    public async deleteFeed(identifier: string): Promise<void> {
        await this.opdsFeedRepository.delete(identifier);
    }

    public async findAllFeeds(): Promise<OpdsFeedView[]> {
        const docs = await this.opdsFeedRepository.findAll();
        return docs.map((doc) => {
            return this.opdsFeedViewConverter.convertDocumentToView(doc);
        });
    }

    public async addFeed(data: OpdsFeed): Promise<OpdsFeedView> {
        const doc = await this.opdsFeedRepository.save(data);
        return this.opdsFeedViewConverter.convertDocumentToView(doc);
    }

    public async updateFeed(data: OpdsFeed): Promise<OpdsFeedView> {
        const doc = await this.opdsFeedRepository.save(data);
        return this.opdsFeedViewConverter.convertDocumentToView(doc);
    }

    public async browse(url: string): Promise<THttpGetOpdsResultView> {
        if (new URL(url).protocol === "opds:") {
            url = url.replace("opds://", "http://");
        }
        return await httpGet(url, {
            timeout: 10000,
        }, async (opdsFeedData) => {
            // let opds2Publication: OPDSPublication = null;
            let opds2Feed: OPDSFeed = null;

            if (opdsFeedData.isFailure) {
                return opdsFeedData;
            }

            debug("opdsFeed content-type", opdsFeedData.contentType);
            if (!OpdsApi.contentTypeisAccepted(opdsFeedData.contentType)) {
                // tslint:disable-next-line: max-line-length
                throw new Error(`Not a valid OPDS HTTP Content-Type for ${opdsFeedData.url} (${opdsFeedData.contentType})`);
            }

            // This is an opds feed in version 1
            // Convert to opds version 2
            const xmlDom = new xmldom.DOMParser().parseFromString(opdsFeedData.body);
            if (xmlDom && xmlDom.documentElement) {
                const isEntry = xmlDom.documentElement.localName === "entry";
                if (isEntry) {
                    throw new Error("OPDS feed is entry");
                }
                // This is an opds feed in version 1
                // Convert to opds version 2
                const opds1Feed = XML.deserialize<OPDS>(xmlDom, OPDS);
                opds2Feed = convertOpds1ToOpds2(opds1Feed);
            } else {
                opds2Feed = TAJSON.deserialize<OPDSFeed>(
                    JSON.parse(opdsFeedData.body),
                    OPDSFeed,
                );
            }
            opdsFeedData.data = await this.opdsFeedViewConverter.convertOpdsFeedToView(opds2Feed, url);
            return opdsFeedData;
        });
    }
}
