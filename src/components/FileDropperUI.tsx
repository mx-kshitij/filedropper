import { ReactElement, createElement, useState, useRef } from "react";
import { EditableValue, ActionValue } from 'mendix';

import "../ui/Filedropper.css";

export interface FileDropperUIProps {
    fileDataAttr: EditableValue<string>;
    onDropAction: ActionValue | undefined;
    defaultText: string;
    dragText: string;
    buttonText: string;
    uploadImage?: any;
    maxFileSize: number;
    maxNumFilesToUpload: number;
    acceptedFileTypes: string[];
    acceptedFilesText: string;
    acceptedFileSizeText: string;
};

interface RejectedFile {
    name: string;
    reason: "Type" | "Size" |"Count";
}

export function FileDropperUI({
    fileDataAttr,
    onDropAction,
    defaultText,
    dragText,
    buttonText,
    uploadImage,
    maxFileSize,
    maxNumFilesToUpload,
    acceptedFileTypes,
    acceptedFilesText,
    acceptedFileSizeText
}: FileDropperUIProps): ReactElement {

    const [dragActive, setDragActive] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const inputRef = useRef(null);
    const drop = useRef(null);
    const filesToReturn: File[] = [];
    const rejectedFiles: RejectedFile[] = [];
    let fileCount = 1;

    const sizeInBytes = maxFileSize * Math.pow(1024, 2);

    const validateFile = (file: File) => {
        if (acceptedFileTypes[0] != "" && (!acceptedFileTypes.find((item) => item.toLowerCase().trim() === file.type.toLowerCase().trim()))) {
            rejectedFiles.push({name: file.name, reason: "Type"});
            return false;
        }
        else if (file.size > sizeInBytes) {
            rejectedFiles.push({name: file.name, reason: "Size"});
            return false;
        }
        else if(fileCount > maxNumFilesToUpload) {
            rejectedFiles.push({name: file.name, reason: "Count"});
            return false;
        }
        else {
            return true;
        }
    }

    const handleFiles = (files: File[]) => {
        const fileList = Array.from(files);
        fileList.forEach(file => {
            if (validateFile(file)) {
                filesToReturn.push(file);
                fileCount = fileCount + 1;
            }
        })
        let fileDataObj: { name: string; objectUrl: string; }[] = [];
        filesToReturn.forEach((curFile) => {
            let curObj = {
                "name": curFile.name,
                "objectUrl": URL.createObjectURL(curFile)
            };
            fileDataObj.push(curObj);
        })
        fileDataAttr.setValue(JSON.stringify(fileDataObj));
        if (fileDataObj.length > 0 && onDropAction != undefined && onDropAction.canExecute && !onDropAction.isExecuting) {
            onDropAction.execute();
        }
        if (rejectedFiles.length) {
            let typeRejects = rejectedFiles.filter(item => item.reason === "Type");
            let valTypeMsg = "", valSizeMsg = "", valCountMsg = "";
            if (typeRejects.length > 0){
                typeRejects.forEach(item => {
                    valTypeMsg === "" ? valTypeMsg = item.name : valTypeMsg = valTypeMsg += ", " + item.name;
                })
                valTypeMsg = "Invalid file type: " + valTypeMsg + "\n";
            }
            let sizeRejects =  rejectedFiles.filter(item => item.reason === "Size");
            if (sizeRejects.length > 0){
                sizeRejects.forEach(item => {
                    valSizeMsg === "" ? valSizeMsg = item.name : valSizeMsg = valSizeMsg += ", " + item.name;
                })
                valSizeMsg = "Invalid file size: " + valSizeMsg + "\n";
            }
            let countRejects =  rejectedFiles.filter(item => item.reason === "Count");
            if (countRejects.length > 0){
                countRejects.forEach(item => {
                    valCountMsg === "" ? valCountMsg = item.name : valCountMsg = valCountMsg += ", " + item.name;
                })
                valCountMsg = "Max file count exceeded: " + valCountMsg;
            }
            setValidationMessage(
                `${valTypeMsg}${valSizeMsg}${valCountMsg}`
            )
            setShowValidation(true);
            setTimeout(() => {
                setShowValidation(false);
            }, 5000)
        }
        else {
            setShowValidation(false);
        }
    }

    const renderValidation = () => {
        return showValidation ?
            <div className="alert alert-danger mx-validation-msg dropzone-validation">
                {validationMessage}
            </div>
            : <div />
    }

    // handle drag events
    const handleDrag = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // triggers when file is dropped
    const handleDrop = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // triggers when file is selected with click
    const handleChange = function (e: any) {
        e.preventDefault();
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    // triggers the input when the button is clicked
    const onButtonClick = () => {
        //@ts-ignore
        inputRef?.current?.click();
    };

    return (
        <div ref={drop} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <input ref={inputRef} type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
            <label htmlFor="input-file-upload" className={dragActive ? "dropzone drag" : "dropzone"}>
                <div>
                    {dragActive ? <div /> : uploadImage}
                    <p>{dragActive ? dragText : defaultText}</p>
                    <button className={dragActive ? "fileSelectButton-drag" : "fileSelectButton"} onClick={onButtonClick}>{buttonText}</button>
                    <p className={dragActive ? "acceptedfiles-drag" : "acceptedfiles"}>{acceptedFilesText} {acceptedFileSizeText}</p>
                </div>
            </label>
            {renderValidation()}
        </div>
    )
}