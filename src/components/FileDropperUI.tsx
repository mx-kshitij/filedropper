import { ReactElement, createElement, useState, useRef, useEffect, useCallback } from "react";
import { EditableValue, ActionValue } from 'mendix';

import "../ui/Filedropper.css";

export interface FileDropperUIProps {
    name: string;
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

const useDragCounter = () => {
    const [dragActive, setDragActive] = useState(false);
    const dragCounter = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (e.type === "dragenter") {
            dragCounter.current++;
            setDragActive(true);
        } else if (e.type === "dragleave") {
            dragCounter.current--;
            if (dragCounter.current <= 0) {
                dragCounter.current = 0; // Ensure counter doesn't go negative
                timeoutRef.current = setTimeout(() => {
                    setDragActive(false);
                }, 50);
            }
        } else if (e.type === "dragover") {
            setDragActive(true);
        }
    }, []);

    const resetDragState = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        dragCounter.current = 0;
        setDragActive(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return { dragActive, handleDrag, resetDragState };
};

export function FileDropperUI({
    name,
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

    const { dragActive, handleDrag, resetDragState } = useDragCounter();
    const [showValidation, setShowValidation] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');
    const [fileTypeWildcard, setFileTypeWildcard] = useState<string[]>([]);
    const inputRef = useRef(null);
    const drop = useRef(null);
    const [isPasteFocused, setIsPasteFocused] = useState(false);
    const filesToReturn: File[] = [];
    const rejectedFiles: RejectedFile[] = [];
    let fileCount = 1;

    const sizeInBytes = maxFileSize * Math.pow(1024, 2);
    // let fileTypeWildcard : string [] = [];
    
    useEffect(() => {
        setFileTypeWildcard(acceptedFileTypes.filter(item => item.indexOf('*') > -1).map(wcitem => wcitem.substring(0,wcitem.indexOf('/')).toLowerCase().trim()));
    }, [])

    const isFileTypeValid = (fileType: string) =>{
        // let valid = false;
        if(fileTypeWildcard.length > 0){
            for(let item of fileTypeWildcard){
                if(fileType.includes(item)){
                    return true;
                }
            }
        }
        if(acceptedFileTypes.find((item) => item.toLowerCase().trim() === fileType)){
            return true;
        }
        return false;
    }

    const validateFile = (file: File) => {
        if(acceptedFileTypes[0] != "" && !isFileTypeValid(file.type.toLowerCase().trim())){
        // if (acceptedFileTypes[0] != "" && (!acceptedFileTypes.find((item) => item.toLowerCase().trim() === file.type.toLowerCase().trim()))) {
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

    // triggers when file is dropped
    const handleDrop = function (e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        resetDragState();
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    // triggers when file is selected with click
    const handleChange = function (e: any) {
        e.preventDefault();
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    // triggers the input when the button is clicked
    const onButtonClick = () => {
        //@ts-ignore
        inputRef?.current?.click();
    };

    // handles paste from clipboard
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const items = e.clipboardData.items;
        const files: File[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Handle file items
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }

        if (files.length > 0) {
            handleFiles(files);
        }
    };

    // Focus management for paste
    useEffect(() => {
        const dropElement = drop.current;
        if (!dropElement) return;

        const handleFocus = () => setIsPasteFocused(true);
        const handleBlur = () => setIsPasteFocused(false);

        //@ts-ignore
        dropElement.addEventListener('focus', handleFocus);
        //@ts-ignore
        dropElement.addEventListener('blur', handleBlur);

        return () => {
            //@ts-ignore
            dropElement.removeEventListener('focus', handleFocus);
            //@ts-ignore
            dropElement.removeEventListener('blur', handleBlur);
        };
    }, []);

    return (
        <div 
            ref={drop} 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
            className={isPasteFocused ? "dropzone-container focused" : "dropzone-container"}
        >
            <input 
                ref={inputRef}
                type="file"
                id={name}
                multiple={true}
                onChange={handleChange}
                className={"hidden"}
            />
            <label 
                htmlFor={name}
                className={dragActive ? "dropzone drag" : "dropzone"}
            >
                <div>
                    {dragActive ? <div /> : uploadImage}
                    <p>{dragActive ? dragText : defaultText}</p>
                    <button 
                        className={dragActive ? "fileSelectButton-drag" : "fileSelectButton"} 
                        onClick={onButtonClick}
                    >
                        {buttonText}
                    </button>
                    <p className={dragActive ? "acceptedfiles-drag" : "acceptedfiles"}>
                        {acceptedFilesText} {acceptedFileSizeText}
                    </p>
                </div>
            </label>
            {renderValidation()}
        </div>
    );
}