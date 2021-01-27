import { BrowserWindow } from "electron";
import { IInfo } from "readium-desktop/renderer/reader/pdf/common/pdfReader.type";
import { _DIST_RELATIVE_URL, _PACKAGING, _RENDERER_PDF_WEBVIEW_BASE_URL } from "readium-desktop/preprocessor-directives";
import * as debug_ from "debug";

const debug = debug_("readium-desktop:main/pdf/extract/index.ts");
debug("_");

type TExtractPdfData = [data: IInfo | undefined, coverPNG: Buffer | undefined];
export const extractPDFData =
    async (pdfPath: string)
        : Promise<TExtractPdfData> => {

        pdfPath = "pdfjs-extract://" + encodeURIComponent(pdfPath);

        let win: BrowserWindow;

        try {

            win = new BrowserWindow({
                width: 800,
                height: 600,
                // show: false,
                webPreferences: {
                    nodeIntegration: true,
                },
            });

            // win.hide(); // doesn't works on linux
            await win.loadURL(`pdfjs://local/web/viewer.html?file=${pdfPath}`);

            const content = win.webContents;
            // content.openDevTools({ activate: true, mode: "detach" });

            const pdata = new Promise<TExtractPdfData>((resolve) =>
                content.on("ipc-message", (e, c, ...arg) => {
                    debug("IPC");
                    debug(e, c, arg);

                    if (c === "pdfjs-extract-data") {

                        const str = arg[0];

                        const data = JSON.parse(str);

                        // const metadata = {
                        // info: data.info,
                        // metadata: data.metadata,
                        // };

                        // debug(metadata);
                        const info: IInfo = { ...(data.info || {}), numberOfPage: data.numberofpages };

                        debug(info);

                        const imgbase64 = data.img?.split(",")[1];
                        const img = Buffer.from(imgbase64 || "", "base64");

                        debug(typeof img);

                        resolve([info, img]);
                    }

                })
            );

            const pdelay = new Promise<TExtractPdfData>((resolve) => setTimeout(() => resolve([undefined, undefined]), 7000));

            const data = await Promise.race([
                pdelay,
                pdata,
            ]);

            return data;

        } catch (e) {

            debug("####");
            debug("####");
            debug("####");

            debug(e);

            debug("####");
            debug("####");



        } finally {

            if (win) {
                win.close();
            }

        }

        return [undefined, undefined];
    }