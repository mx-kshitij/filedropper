/**
 * This file was generated from Filedropper.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, WebImage } from "mendix";

export interface FiledropperContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    fileDataAttr: EditableValue<string>;
    onDropAction?: ActionValue;
    defaultText: string;
    dragText: string;
    buttonText: string;
    uploadImage?: DynamicValue<WebImage>;
    maxFileSize: number;
    acceptedFileTypes: string;
    acceptedFilesText: string;
}

export interface FiledropperPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    fileDataAttr: string;
    onDropAction: {} | null;
    defaultText: string;
    dragText: string;
    buttonText: string;
    uploadImage: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    maxFileSize: number | null;
    acceptedFileTypes: string;
    acceptedFilesText: string;
}
