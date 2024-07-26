import { ReactElement, createElement, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { ValueStatus } from 'mendix';
import { FiledropperContainerProps } from "../typings/FiledropperProps";

import "./ui/Filedropper.css";

export function Filedropper({ fileDataAttr, onDropAction }: FiledropperContainerProps): ReactElement {
    if(fileDataAttr === null || fileDataAttr === undefined || fileDataAttr.status != ValueStatus.Available){
        return <div/>;
    }
    const onDrop = useCallback((acceptedFiles: File[]) => {
        let fileDataObj: { name: string; objectUrl: string; }[] = [];
        acceptedFiles.forEach((curFile) => {
            let curObj = {
                "name" : curFile.name,
                "objectUrl": URL.createObjectURL(curFile)
            };
            fileDataObj.push(curObj);
        })
        fileDataAttr.setValue(JSON.stringify(fileDataObj));
        if(onDropAction && onDropAction.canExecute && !onDropAction.isExecuting)
            onDropAction.execute();
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
            }
        </div>
    )
}
