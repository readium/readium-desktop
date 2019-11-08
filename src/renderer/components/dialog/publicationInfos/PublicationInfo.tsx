// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import classNames from "classnames";
import * as moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { DialogType } from "readium-desktop/common/models/dialog";
import * as dialogActions from "readium-desktop/common/redux/actions/dialog";
import { OpdsPublicationView } from "readium-desktop/common/views/opds";
import { PublicationView } from "readium-desktop/common/views/publication";
import { TPublicationApiGet_result } from "readium-desktop/main/api/publication";
import { apiAction } from "readium-desktop/renderer/apiAction";
import { apiSubscribe } from "readium-desktop/renderer/apiSubscribe";
import * as styles from "readium-desktop/renderer/assets/styles/bookDetailsDialog.css";
import Cover from "readium-desktop/renderer/components/publication/Cover";
import TagManager from "readium-desktop/renderer/components/publication/TagManager";
import {
    TranslatorProps, withTranslator,
} from "readium-desktop/renderer/components/utils/hoc/translator";
import { RootState } from "readium-desktop/renderer/redux/states";
import { TDispatch } from "readium-desktop/typings/redux";
import { Unsubscribe } from "redux";
import { oc } from "ts-optchain";

import Dialog from "../Dialog";
import CatalogControls from "./catalogControls";
import CatalogLcpControls from "./catalogLcpControls";
import OpdsControls from "./opdsControls";

// tslint:disable-next-line: no-empty-interface
interface IBaseProps extends TranslatorProps {
}
// IProps may typically extend:
// RouteComponentProps
// ReturnType<typeof mapStateToProps>
// ReturnType<typeof mapDispatchToProps>
// tslint:disable-next-line: no-empty-interface
interface IProps extends IBaseProps, ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

interface IState {
    seeMore: boolean;
    needSeeMore: boolean;
    publicationView: TPublicationApiGet_result | undefined;
    coverZoom: boolean;
}

class PublicationInfo extends React.Component<IProps, IState> {
    private descriptionWrapperRef: any;
    private descriptionRef: any;
    private unsubscribe: Unsubscribe;

    constructor(props: IProps) {
        super(props);

        this.state = {
            seeMore: false,
            needSeeMore: false,
            publicationView: undefined,
            coverZoom: false,
        };
        this.toggleSeeMore = this.toggleSeeMore.bind(this);
        this.getPublicationFromId = this.getPublicationFromId.bind(this);
    }

    public componentDidMount() {
        if (this.props.publicationIdentifier) {
            this.unsubscribe = apiSubscribe([
                "publication/updateTags",
            ], this.getPublicationFromId);
        }

        setTimeout(this.needSeeMoreButton.bind(this), 500);
    }

    public componentWillUnmount() {
        if (this.props.publicationIdentifier) {
            this.unsubscribe();
        }
    }

    public render(): React.ReactElement<{}> {

        // tslint:disable-next-line: max-line-length
        const opdsPublicationView: OpdsPublicationView = this.props.opdsPublicationView ? this.props.opdsPublicationView : undefined;
        const normalPublicationView: PublicationView = opdsPublicationView ? undefined : this.state.publicationView;
        const normalOrOpdsPublicationView = opdsPublicationView ? opdsPublicationView : normalPublicationView;

        if (!this.props.open || (!normalPublicationView && !opdsPublicationView)) {
            return (<></>);
        }

        const { __, translator } = this.props;
        const controlsComponent = (() => {
            if (this.props.displayControls) {
                if (opdsPublicationView) {
                    return (<OpdsControls opdsPublicationView={opdsPublicationView} />);
                }
                if (normalPublicationView.lcp) {
                    return (<CatalogLcpControls publicationView={normalPublicationView} />);
                }
                return (<CatalogControls publicationView={normalPublicationView} />);
            }
            return (<></>);
        })();

        const authors = normalOrOpdsPublicationView.authors.map((author) => {
            return translator.translateContentField(author);
        }).join(", ");
        const formatedPublishers = oc(normalOrOpdsPublicationView).publishers([]).join(", ");
        const formatedPublishedDateComponent = (() => {
            if (normalOrOpdsPublicationView.publishedAt) {
                const date = moment(normalOrOpdsPublicationView.publishedAt).format("L");
                if (date) {
                    return (
                        <p>
                            <span>{__("catalog.released")}
                            </span> <i className={styles.allowUserSelect}>{date}</i>
                        </p>
                    );
                }
            }
            return (<></>);
        })();
        const publicationLanguageComponent = (() => {
            if (normalOrOpdsPublicationView.languages) {
                return normalOrOpdsPublicationView.languages
                    .map((lang: string, index: number) => {
                        const l = lang.split("-")[0];
                        const ll = ((__(`languages.${l}` as any) as unknown) as string).replace(`languages.${l}`, lang);
                        const note = (lang !== ll) ? ` (${lang})` : "";
                        const suffix = ((index < (normalOrOpdsPublicationView.languages.length - 1)) ? ", " : "");
                        return <i
                            key={"lang-" + index}
                            title={lang}
                            className={styles.allowUserSelect}
                        >
                            {ll + note + suffix}
                        </i>;
                    });
            }
            return (<></>);
        })();

        const renderInfo = () =>
            <>
                <div className={styles.dialog_left}>
                    <div className={styles.image_wrapper}>
                        <div>
                            <Cover
                                publicationViewMaybeOpds={normalOrOpdsPublicationView}
                                onClick={() => normalOrOpdsPublicationView.cover.coverUrl && this.coverOnClick()}
                                onKeyPress={this.coverOnKeyPress}
                            />
                        </div>
                    </div>
                    {controlsComponent}
                </div>
                <div className={styles.dialog_right}>
                    <h2 className={styles.allowUserSelect}>{normalOrOpdsPublicationView.title}</h2>
                    <div>
                        <p className={classNames(styles.allowUserSelect, styles.author)}>{authors}</p>
                        {formatedPublishedDateComponent}
                        <div className={styles.tags}>
                            <div className={styles.tag_list}>
                                <span>Tags</span>
                                <TagManager
                                    publicationIdentifier={(normalOrOpdsPublicationView as PublicationView).identifier}
                                    tags={normalOrOpdsPublicationView.tags}
                                    canModifyTag={opdsPublicationView ? false : true}
                                />
                            </div>
                        </div>

                        {normalOrOpdsPublicationView.description && <>
                            <h3>{__("catalog.description")}</h3>
                            <div
                                ref={(ref) => this.descriptionWrapperRef = ref}
                                className={classNames(
                                    styles.descriptionWrapper,
                                    this.state.needSeeMore && styles.hideEnd,
                                    this.state.seeMore && styles.seeMore,
                                )}
                            >
                                <p
                                    ref={(ref) => this.descriptionRef = ref}
                                    className={classNames(styles.allowUserSelect, styles.description)}
                                >
                                    {normalOrOpdsPublicationView.description}
                                </p>
                            </div>
                            {this.state.needSeeMore &&
                                <button aria-hidden className={styles.seeMoreButton} onClick={this.toggleSeeMore}>
                                    {this.state.seeMore ? __("publication.seeLess") : __("publication.seeMore")}
                                </button>
                            }
                        </>}

                        <h3>{__("catalog.moreInfo")}</h3>

                        <p>
                            {formatedPublishers &&
                                <><span>{__("catalog.publisher")}
                                </span> <i className={styles.allowUserSelect}>{formatedPublishers}</i> <br /></>
                            }
                            <span>{__("catalog.lang")}</span>{publicationLanguageComponent}<br />
                            <span>{__("catalog.id")}
                            </span>
                            <i className={styles.allowUserSelect}>{normalOrOpdsPublicationView.workIdentifier}</i>
                            <br />
                        </p>
                    </div>
                </div>
            </>;

        return (
            <Dialog open={true} close={() => this.state.coverZoom ? this.coverOnClick() : this.props.closeDialog()}>
                {this.state.coverZoom ?
                    <Cover
                        publicationViewMaybeOpds={normalOrOpdsPublicationView}
                        coverTypeUrl="coverUrl"
                        onClick={this.coverOnClick}
                        onKeyPress={this.coverOnKeyPress}
                    /> :
                    renderInfo()
                }
            </Dialog>
        );
    }

    private coverOnKeyPress = (e: React.KeyboardEvent<HTMLImageElement>) =>
        e.key === "Enter" && this.coverOnClick()

    private coverOnClick = () => this.setState({
        coverZoom: !this.state.coverZoom,
    })

    private toggleSeeMore() {
        this.setState({ seeMore: !this.state.seeMore });
    }

    private needSeeMoreButton() {
        if (!this.descriptionWrapperRef || !this.descriptionRef) {
            return;
        }
        const need = this.descriptionWrapperRef.offsetHeight < this.descriptionRef.offsetHeight;
        this.setState({ needSeeMore: need });
    }

    private getPublicationFromId() {
        apiAction("publication/get", this.props.publicationIdentifier)
            .then((publicationView) => this.setState({ publicationView }))
            .catch((error) => console.error(`Error to fetch publication/get`, error));
    }
}

const mapDispatchToProps = (dispatch: TDispatch, props: IBaseProps) => {
    return {
        closeDialog: () => {
            if ((props as IProps).publicationInfoReader) {
                // TODO: this is a short-term hack.
                // Can we instead subscribe to Redux action type == ActionType.CloseRequest,
                // but narrow it down specically to the window instance (not application-wide)
                window.document.dispatchEvent(new Event("Thorium:DialogClose"));
            }
            dispatch(
                dialogActions.closeRequest.build(),
            );
        },
    };
};

const mapStateToProps = (state: RootState, _props: IBaseProps) => ({
    ...{
        open: state.dialog.type === "publication-info" || state.dialog.type === "publication-info-reader",
        displayControls: state.dialog.type === "publication-info",
        publicationInfoReader: state.dialog.type === "publication-info-reader",
    },
    ...(state.dialog.data as DialogType["publication-info"]),
    ...(state.dialog.data as DialogType["publication-info-reader"]),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslator(PublicationInfo));
