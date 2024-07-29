import { ReactElement, createElement } from "react";
// import { HelloWorldSample } from "./components/HelloWorldSample";
import { FiledropperPreviewProps } from "../typings/FiledropperProps";

const defaultUploadImage = "data:image/png;base64,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";

export function preview({ buttonText, defaultText, acceptedFilesText, acceptedFileTypes }: FiledropperPreviewProps): ReactElement {
    return (
        <div className="dropzone">
            <img className="uploadImage" src={defaultUploadImage} />
            <p>{defaultText}</p>
            <button type="button" className="fileSelectButton">
                {buttonText}
            </button>
            {acceptedFilesString(acceptedFilesText, acceptedFileTypes)}
        </div>
    )
}

const acceptedFilesString = (acceptedFilesText: string, acceptedFileTypes: string) =>{
    if(acceptedFilesText)
        return <p className="acceptedfiles">{acceptedFilesText}</p>;
    else{
        if(acceptedFileTypes)
            return <p className="acceptedfiles">Accepted file types: {acceptedFileTypes}</p>;
        else
            return null;
    }
}

export function getPreviewCss(): string {
    return require("./ui/Filedropper.css");
}
