// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as debug_ from "debug";
import * as React from "react";
import { connect } from "react-redux";
import { readerActions } from "readium-desktop/common/redux/actions";
import * as dialogActions from "readium-desktop/common/redux/actions/dialog";
import { PublicationView } from "readium-desktop/common/views/publication";
import * as ArrowIcon from "readium-desktop/renderer/assets/icons/arrow-right.svg";
import * as DeleteIcon from "readium-desktop/renderer/assets/icons/baseline-close-24px.svg";
import * as LoopIcon from "readium-desktop/renderer/assets/icons/loop.svg";
import * as styles from "readium-desktop/renderer/assets/styles/bookDetailsDialog.css";
import {
    TranslatorProps, withTranslator,
} from "readium-desktop/renderer/components/utils/hoc/translator";
import SVG from "readium-desktop/renderer/components/utils/SVG";
import { TMouseEvent } from "readium-desktop/typings/react";
import { TDispatch } from "readium-desktop/typings/redux";

import { StatusEnum } from "@r2-lcp-js/parser/epub/lsd";

// import { apiAction } from "readium-desktop/renderer/apiAction";

// Logger
const debug = debug_("readium-desktop:renderer:CatalogLcpControls");

// tslint:disable-next-line: no-empty-interface
interface IBaseProps extends TranslatorProps {
    publication: PublicationView;
}
// IProps may typically extend:
// RouteComponentProps
// ReturnType<typeof mapStateToProps>
// ReturnType<typeof mapDispatchToProps>
// tslint:disable-next-line: no-empty-interface
interface IProps extends IBaseProps, ReturnType<typeof mapDispatchToProps> {
}

class CatalogLcpControls extends React.Component<IProps> {
    public constructor(props: IProps) {
        super(props);

        this.handleRead = this.handleRead.bind(this);
        this.deletePublication = this.deletePublication.bind(this);
    }

    public componentDidMount() {
        // apiAction("lcp/getLsdStatus", {publication: this.props.publication})
        // .then((request) => this.setState({lsdStatus: request.data}))
        // .catch((error) => {
        //     console.error(`Error lcp/getLsdStatus`, error);
        // });
    }

    public render(): React.ReactElement<{}> {
        const { __, publication } = this.props;

        if (!publication) {
            return (<></>);
        }

        const lsdOkay = publication.lcp &&
            publication.lcp.lsd &&
            publication.lcp.lsd.lsdStatus;

        if (lsdOkay) {
            debug(publication.lcp.lsd.lsdStatus);
        }

        const lsdStatus = lsdOkay &&
            publication.lcp.lsd.lsdStatus.status ?
            publication.lcp.lsd.lsdStatus.status : undefined;

        const lsdReturnLink = (!lsdOkay || !publication.lcp.lsd.lsdStatus.links) ? undefined :
            publication.lcp.lsd.lsdStatus.links.find((link) => {
                return link.rel === "return";
            });

        const lsdRenewLink = (!lsdOkay || !publication.lcp.lsd.lsdStatus.links) ? undefined :
            publication.lcp.lsd.lsdStatus.links.find((link) => {
                return link.rel === "renew";
            });
        return (
            <>
                {
                (lsdStatus === StatusEnum.Active || lsdStatus === StatusEnum.Ready) ?
                <button  onClick={this.handleRead} className={styles.lire}>{__("catalog.readBook")}</button>
                : (lsdStatus === StatusEnum.Expired ?
                <p style={{color: "red"}}>{__("publication.expiredLcp")}</p>
                : ((lsdStatus === StatusEnum.Revoked || lsdStatus === StatusEnum.Cancelled) ?
                <p style={{color: "red"}}>{__("publication.revokedLcp")}</p>
                : (lsdStatus === StatusEnum.Returned ?
                <p style={{color: "red"}}>{__("publication.returnedLcp")}</p> :
                <p style={{color: "red"}}>{`LCP LSD: ${lsdStatus}`}</p>
                )))}
                <ul className={styles.liens}>
                    {
                        // lsdStatus === StatusEnum.Expired &&
                        lsdRenewLink &&
                        <li>
                            <button onClick={ this.props.openRenewDialog }>
                                <SVG svg={LoopIcon} ariaHidden/>
                                {__("publication.renewButton")}
                            </button>
                        </li>
                    }
                    {
                        lsdReturnLink &&
                        <li>
                            <button onClick={ this.props.openReturnDialog }>
                                <SVG svg={ArrowIcon} ariaHidden/>
                                {__("publication.returnButton")}
                            </button>
                        </li>
                    }
                    <li>
                        <button onClick={ this.deletePublication }>
                            <SVG svg={DeleteIcon} ariaHidden/>
                            {__("catalog.deleteBook")}
                        </button>
                    </li>
                </ul>
            </>
        );
    }

    private deletePublication(e: TMouseEvent) {
        e.preventDefault();
        this.props.openDeleteDialog();
    }

    private handleRead(e: TMouseEvent) {
        e.preventDefault();

        this.props.openReader();
    }
}

const mapDispatchToProps = (dispatch: TDispatch, props: IBaseProps) => {
    return {
        openReader: () => {
            dispatch({
                type: readerActions.ActionType.OpenRequest,
                payload: {
                    publication: {
                        identifier: props.publication.identifier,
                    },
                },
            });
        },
        openDeleteDialog: () => {
            dispatch(dialogActions.open("delete-publication-confirm",
                {
                    publication: props.publication,
                },
            ));
        },
        openRenewDialog: () => {
            dispatch(dialogActions.open("lsd-renew-confirm",
                {
                    publication: props.publication,
                },
            ));
        },
        openReturnDialog: () => {
            dispatch(dialogActions.open("lsd-return-confirm",
                {
                    publication: props.publication,
                },
            ));
        },
    };
};

export default connect(undefined, mapDispatchToProps)(withTranslator(CatalogLcpControls));
