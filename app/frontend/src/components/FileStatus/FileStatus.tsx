// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useState, useEffect } from "react";
import { Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';
import { Stack } from "@fluentui/react";
import { DocumentsDetailList, IDocument } from "./DocumentsDetailList";
import { ArrowClockwise24Filled } from "@fluentui/react-icons";
import { animated, useSpring } from "@react-spring/web";
import { getAllUploadStatus, FileUploadBasicStatus, GetUploadStatusRequest, FileState, getFolders, getTags } from "../../api";
import { useTranslation } from 'react-i18next';

import styles from "./FileStatus.module.css";

const dropdownTimespanStyles: Partial<IDropdownStyles> = { dropdown: { width: 150 } };
const dropdownFileStateStyles: Partial<IDropdownStyles> = { dropdown: { width: 200 } };
const dropdownFolderStyles: Partial<IDropdownStyles> = { dropdown: { width: 200 } };
const dropdownTagStyles: Partial<IDropdownStyles> = { dropdown: { width: 200 } };

interface Props {
    className?: string;
}

export const FileStatus = ({ className }: Props) => {
    const { t } = useTranslation();

    const dropdownTimespanOptions = [
        { key: 'Time Range', text: t('endTimeRange'), itemType: DropdownMenuItemType.Header },
        { key: '4hours', text: `4 ${t('hours')}` },
        { key: '12hours', text: `12 ${t('hours')}` },
        { key: '24hours', text: `24 ${t('hours')}` },
        { key: '7days', text: `7 ${t('days')}` },
        { key: '30days', text: `30 ${t('days')}` },
        { key: '-1days', text: t('all') },
    ];

    const dropdownFileStateOptions = [
        { key: 'FileStates', text: t('fileStates'), itemType: DropdownMenuItemType.Header },
        { key: FileState.All, text: t('all') },
        { key: FileState.Complete, text: t('complete') },
        { key: FileState.Error, text: t('error') },
        { key: FileState.Processing, text: t('processing') },
        { key: FileState.Indexing, text: t('indexing') },
        { key: FileState.Queued, text: t('queued') },
        { key: FileState.Skipped, text: t('skipped') },
        { key: FileState.UPLOADED, text: t('uploaded') },
        { key: FileState.THROTTLED, text: t('throttled') },
        { key: FileState.DELETING, text: t('deleting') },
        { key: FileState.DELETED, text: t('deleted') },
    ];

    const [selectedTimeFrameItem, setSelectedTimeFrameItem] = useState<IDropdownOption>();
    const [selectedFileStateItem, setSelectedFileStateItem] = useState<IDropdownOption>();
    const [SelectedFolderItem, setSelectedFolderItem] = useState<IDropdownOption>();
    const [SelectedTagItem, setSelectedTagItem] = useState<IDropdownOption>();

    const [folderOptions, setFolderOptions] = useState<IDropdownOption[]>([]);
    const [tagOptions, setTagOptions] = useState<IDropdownOption[]>([]);
    const [files, setFiles] = useState<IDocument[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onTimeSpanChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption<any> | undefined): void => {
        setSelectedTimeFrameItem(item);
    };

    const onFileStateChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption<any> | undefined): void => {
        setSelectedFileStateItem(item);
    };

    const onFolderChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption<any> | undefined): void => {
        setSelectedFolderItem(item);
    };

    const onTagChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption<any> | undefined): void => {
        setSelectedTagItem(item);
    };

    const onFilesSorted = (items: IDocument[]): void => {
        setFiles(items);
    };

    const onGetStatusClick = async () => {
        setIsLoading(true);
        var timeframe = 4;
        switch (selectedTimeFrameItem?.key as string) {
            case "4hours":
                timeframe = 4;
                break;
            case "12hours":
                timeframe = 12;
                break;
            case "24hours":
                timeframe = 24;
                break;
            case "7days":
                timeframe = 168;
                break;
            case "30days":
                timeframe = 720;
                break;
            case "-1days":
                timeframe = -1;
                break;
            default:
                timeframe = 4;
                break;
        }

        const request: GetUploadStatusRequest = {
            timeframe: timeframe,
            state: selectedFileStateItem?.key == undefined ? FileState.All : selectedFileStateItem?.key as FileState,
            folder: SelectedFolderItem?.key == undefined ? 'Root' : SelectedFolderItem?.key as string,
            tag: SelectedTagItem?.key == undefined ? 'All' : SelectedTagItem?.key as string
        }
        const response = await getAllUploadStatus(request);
        const list = convertStatusToItems(response.statuses);
        setIsLoading(false);
        setFiles(list);
    }

    // fetch unique folder names from Azure Blob Storage
    const fetchFolders = async () => {
        try {
            const folders = await getFolders(); // Await the promise
            const rootOption = { key: 'Root', text: 'Root' }; // Create the "Root" option            
            const folderDropdownOptions = [rootOption, ...folders.map((folder: string) => ({ key: folder, text: folder }))];
            setFolderOptions(folderDropdownOptions);
        }
        catch (e) {
            console.log(e);
        }
    };

    // fetch unique tag names from Azure Cosmos DB
    const fetchTags = async () => {
        try {
            const tags = await getTags(); // Await the promise
            const AllOption = { key: 'All', text: 'All' }; // Create the "ALL" option            
            const TagsDropdownOptions = [AllOption, ...tags.map((tag: string) => ({ key: tag, text: tag }))];
            setTagOptions(TagsDropdownOptions);
        }
        catch (e) {
            console.log(e);
        }
    };



    // Effect to fetch folders & tags on mount
    useEffect(() => {
        fetchFolders();
        fetchTags();
    }, []);

    function convertStatusToItems(fileList: FileUploadBasicStatus[]) {
        const items: IDocument[] = [];
        for (let i = 0; i < fileList.length; i++) {
            let fileExtension = fileList[i].file_name.split('.').pop();
            fileExtension = fileExtension == undefined ? 'Folder' : fileExtension.toUpperCase()
            try {
                items.push({
                    key: fileList[i].id,
                    name: fileList[i].file_name,
                    iconName: FILE_ICONS[fileExtension.toLowerCase()],
                    fileType: fileExtension,
                    filePath: fileList[i].file_path,
                    fileFolder: fileList[i].file_path.slice(0, fileList[i].file_path.lastIndexOf('/')),
                    state: fileList[i].state,
                    state_description: fileList[i].state_description,
                    upload_timestamp: fileList[i].start_timestamp,
                    modified_timestamp: fileList[i].state_timestamp,
                    status_updates: fileList[i].status_updates.map(su => ({
                        status: su.status,
                        status_timestamp: su.status_timestamp,
                        status_classification: su.status_classification,
                    })),
                    value: fileList[i].id,
                    tags: fileList[i].tags
                });
            }
            catch (e) {
                console.log(e);
            }
        }
        return items;
    }

    const FILE_ICONS: { [id: string]: string } = {
        "csv": 'csv',
        "docx": 'docx',
        "pdf": 'pdf',
        "pptx": 'pptx',
        "txt": 'txt',
        "html": 'xsn'
    };

    const animatedStyles = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 }
    });

    return (
        <div className={styles.container}>
            <div className={`${styles.options} ${className ?? ""}`} >
                <Dropdown
                    label={t('uploadedInLast')}
                    defaultSelectedKey='4hours'
                    onChange={onTimeSpanChange}
                    placeholder={t('selectTimeRange')}
                    options={dropdownTimespanOptions}
                    styles={dropdownTimespanStyles}
                    aria-label={t('timespanOptions')}
                />
                <Dropdown
                    label={t('fileState')}
                    defaultSelectedKey={'ALL'}
                    onChange={onFileStateChange}
                    placeholder={t('selectFileState')}
                    options={dropdownFileStateOptions}
                    styles={dropdownFileStateStyles}
                    aria-label={t('fileStateOptions')}
                />
                <Dropdown
                    label={t('folder')}
                    defaultSelectedKey={'Root'}
                    onChange={onFolderChange}
                    placeholder={t('selectFolder')}
                    options={folderOptions}
                    styles={dropdownFolderStyles}
                    aria-label={t('folderOptions')}
                />
                <Dropdown
                    label={t('tag')}
                    defaultSelectedKey={'All'}
                    onChange={onTagChange}
                    placeholder={t('selectTag')}
                    options={tagOptions}
                    styles={dropdownTagStyles}
                    aria-label={t('tagOptions')}
                />
            </div>
            {isLoading ? (
                <animated.div style={{ ...animatedStyles }}>
                    <Stack className={styles.loadingContainer} verticalAlign="space-between">
                        <Stack.Item grow>
                            <p className={styles.loadingText}>
                                {t('gettingFileStatuses')}
                                <span className={styles.loadingdots} />
                            </p>
                        </Stack.Item>
                    </Stack>
                </animated.div>
            ) : (
                <div className={styles.resultspanel}>
                    <DocumentsDetailList items={files == undefined ? [] : files} onFilesSorted={onFilesSorted} onRefresh={onGetStatusClick} />
                </div>
            )}
        </div>
    );
};