// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";
import { connect } from "react-redux";
import { IOpdsNavigationLinkView } from "readium-desktop/common/views/opds";
import * as styles from "readium-desktop/renderer/assets/styles/opds.css";
import { RootState } from "readium-desktop/renderer/redux/states";

import Entry from "./Entry";

interface IBaseProps {
<<<<<<< HEAD
    entries: OpdsLinkView[];
=======
    entries: IOpdsNavigationLinkView[];
>>>>>>> panac/fix/opds-to-view-from-main/convert-to-renderer
}
// IProps may typically extend:
// RouteComponentProps
// ReturnType<typeof mapStateToProps>
// ReturnType<typeof mapDispatchToProps>
// tslint:disable-next-line: no-empty-interface
<<<<<<< HEAD
interface IProps extends IBaseProps, RouteComponentProps, ReturnType<typeof mapStateToProps> {
=======
interface IProps extends IBaseProps, ReturnType<typeof mapStateToProps> {
>>>>>>> panac/fix/opds-to-view-from-main/convert-to-renderer
}

class EntryList extends React.Component<IProps, undefined> {

    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactElement<{}> {
        return (
            <section id={styles.flux_list}>
                <ul>
                    {this.props.entries.map((entry, index) =>
                        <li key={index} >
                            <Entry entry={entry} level={this.props.level} />
                        </li>,
                    )}
                </ul>
            </section>
        );
    }
}

const mapStateToProps = (state: RootState, _props: IBaseProps) => ({
    level: state.opds.browser.breadcrumb.length + 1,
});

export default connect(mapStateToProps)(EntryList);
