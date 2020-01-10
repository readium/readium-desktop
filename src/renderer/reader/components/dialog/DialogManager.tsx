// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "readium-desktop/renderer/library/redux/states";

import PublicationInfo from "readium-desktop/renderer/common/components/dialog/publicationInfos/PublicationInfo";

// tslint:disable-next-line: no-empty-interface
interface IBaseProps {
}
// IProps may typically extend:
// RouteComponentProps
// ReturnType<typeof mapStateToProps>
// ReturnType<typeof mapDispatchToProps>
// tslint:disable-next-line: no-empty-interface
interface IProps extends IBaseProps, ReturnType<typeof mapStateToProps> {
}

class DialogManager extends React.Component<IProps, undefined> {

    constructor(props: IProps) {
        super(props);
    }

    public render(): React.ReactElement<{}> {
        const dialog = this.props.dialog;

        if (!dialog || !dialog.open) {
            return (<></>);
        }

        return (
            <>
                <PublicationInfo></PublicationInfo>
            </>
        );

    }
}

const mapStateToProps = (state: RootState, _props: IBaseProps) => {
    return {
        dialog: state.dialog,
    };
};

export default connect(mapStateToProps)(DialogManager);