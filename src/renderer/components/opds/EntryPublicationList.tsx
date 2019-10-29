// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as qs from "query-string";
import * as React from "react";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { IOpdsPublicationView, IOpdsResultView } from "readium-desktop/common/views/opds";
import { DisplayType } from "readium-desktop/renderer/components/opds/Header";
import GridView from "readium-desktop/renderer/components/utils/GridView";
import ListView from "readium-desktop/renderer/components/utils/ListView";
import Loader from "readium-desktop/renderer/components/utils/Loader";
import { RootState } from "readium-desktop/renderer/redux/states";

import PageNavigation from "./PageNavigation";

interface IProps extends RouteComponentProps {
    publications: IOpdsPublicationView[] | undefined;
    links: IOpdsResultView["links"];
    pageInfo?: IOpdsResultView["metadata"];
}

class EntryPublicationList extends React.Component<IProps> {
    public render() {
        // FIXME : try to remove this any
        let DisplayView: React.ComponentClass<any> = GridView;

        if (this.props.location) {
            const parsedResult = qs.parse(this.props.location.search);

            if (parsedResult.displayType === DisplayType.List) {
                DisplayView = ListView;
            }
        }

        // force cast on PublicationView[]
        // It's an hack from no typing to static typing
        // FIXME in the future
        return (
            <>
                {this.props.publications ?
                    <>
                        <DisplayView publications={this.props.publications} isOpdsView={true} />
                        <PageNavigation
                            pageLinks={this.props.links}
                            pageInfo={this.props.pageInfo}
                        />
                    </>
                    : <Loader />}
            </>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    location: state.router.location,
});

export default connect(mapStateToProps)(withRouter(EntryPublicationList));
