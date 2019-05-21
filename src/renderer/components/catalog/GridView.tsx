// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import { CatalogEntryView } from "readium-desktop/common/views/catalog";

import PublicationCard from "readium-desktop/renderer/components/publication/PublicationCard";

import Slider from "readium-desktop/renderer/components/utils/Slider";

import * as styles from "readium-desktop/renderer/assets/styles/myBooks.css";

import { RouteComponentProps } from "react-router-dom";

import CatalogMenu from "readium-desktop/renderer/components/publication/menu/CatalogMenu";

import GridTagLayout from "./GridTagLayout";
import SortMenu from "./SortMenu";

interface GridViewProps extends RouteComponentProps {
    catalogEntries: CatalogEntryView[];
}

interface GridViewState {
    tabEntries: CatalogEntryView[];
    status: string;
}

export default class GridView extends React.Component<GridViewProps, GridViewState> {
    public constructor(props: any) {
        super(props);

        this.state = {
            tabEntries: this.props.catalogEntries.slice(),
            status: "count",
        };
        this.sortByAlpha = this.sortByAlpha.bind(this);
        this.sortbyCount = this.sortbyCount.bind(this);
    }

    public render(): React.ReactElement<{}> {
        return (
            <>
                { this.props.catalogEntries.map((entry, i: number) => {
                        return entry.publications.length > 0 ? (
                            <section key={ i }>
                                { i <= 1 ? (
                                    <div className={ styles.title }>
                                        <h1>{ entry.title }</h1>
                                    </div>
                                    ) :
                                    (<></>)
                                }
                                { i <= 1 ? (
                                        <Slider
                                            className={ styles.slider }
                                            content={ entry.publications.map((pub) =>
                                                <PublicationCard
                                                    key={ pub.identifier }
                                                    publication={ pub }
                                                    menuContent={ CatalogMenu }
                                                />,
                                            )}
                                        />
                                    ) :
                                    (<></>)
                                }
                            </section>
                        ) : <></>;
                })}
                <GridTagLayout
                entries={this.state.tabEntries}
                content={
                    <SortMenu
                        onClickAlphaSort={this.sortByAlpha}
                        onClickCountSort={this.sortbyCount}
                    />}
                />
            </>
        );
    }

    private sortbyCount() {
        this.setState({
            status: "count",
        });
        this.state.tabEntries.sort((a, b) => {
            if (a.totalCount < b.totalCount) {
                return (1);
            } else if (a.totalCount > b.totalCount) {
                return (-1);
            }
            return (0);
        });
    }

    private sortByAlpha() {
        this.setState({
            status: "alpha",
        });
        this.state.tabEntries.sort((a, b) => {
            if (a.title > b.title) {
                return (1);
            } else if (a.title < b.title) {
                return (-1);
            }
            return (0);
        });
    }

}
