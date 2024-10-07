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
    acceptedFileTypes: string[];
    acceptedFilesText: string;
    acceptedFileSizeText: string;
    rejectedFilesText: string;
};

export function FileDropperUI({
    fileDataAttr,
    onDropAction,
    defaultText,
    dragText,
    buttonText,
    uploadImage,
    maxFileSize,
    acceptedFileTypes,
    acceptedFilesText,
    acceptedFileSizeText,
    rejectedFilesText
}: FileDropperUIProps): ReactElement {

    const [dragActive, setDragActive] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const inputRef = useRef(null);
    const drop = useRef(null);
    const filesToReturn: File[] = [];
    const rejectedFiles: string[] = [];

    const sizeInBytes = maxFileSize * Math.pow(1024, 2);

    const validateFile = (file: File) => {
        if(!acceptedFileTypes.find((item) => item.toLowerCase().trim() === file.type.toLowerCase().trim())){
            rejectedFiles.push(file.name);
            return false;
        }
        else if(file.size > sizeInBytes){
            rejectedFiles.push(file.name);
            return false;
        }
        else{
            return true;
        }
    }

    const handleFiles = (files: File[]) => {
        const fileList = Array.from(files);
        fileList.forEach(file => {
            if(acceptedFileTypes[0] === "" ){
                filesToReturn.push(file);
            }
            else{
                if(validateFile(file)){
                    filesToReturn.push(file);
                }
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
        if(rejectedFiles.length){
            setValidationMessage(`${rejectedFilesText} ${rejectedFiles.toString()}`);
            setShowValidation(true);
            setTimeout(()=>{
                setShowValidation(false);
            },5000)
        }
        else{
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
                    {dragActive ? <div/> : uploadImage}
                    <p>{dragActive ? dragText : defaultText}</p>
                    <button className={dragActive ? "fileSelectButton-drag" :"fileSelectButton"} onClick={onButtonClick}>{buttonText}</button>
                    <p className={dragActive ? "acceptedfiles-drag" :"acceptedfiles"}>{acceptedFilesText} {acceptedFileSizeText}</p>
                </div>
            </label>
            {renderValidation()}
        </div>
    )
}