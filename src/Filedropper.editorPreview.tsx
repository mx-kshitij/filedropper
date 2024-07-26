import { ReactElement, createElement } from "react";
// import { HelloWorldSample } from "./components/HelloWorldSample";
import { FiledropperPreviewProps } from "../typings/FiledropperProps";

export function preview({}: FiledropperPreviewProps): ReactElement {
    return (
        <div >
            {
                <p>Drag 'n' drop some files here, or click to select files</p>
            }
        </div>
    )
}

export function getPreviewCss(): string {
    return require("./ui/Filedropper.css");
}
