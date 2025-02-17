// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useState } from 'react';
import { Pivot, PivotItem } from "@fluentui/react";
import { ITag } from '@fluentui/react/lib/Pickers';
import { FilePicker } from "../../components/filepicker/file-picker";
import { FileStatus } from "../../components/FileStatus/FileStatus";
import { TagPickerInline } from "../../components/TagPicker/TagPicker"
import { FolderPicker } from '../../components/FolderPicker/FolderPicker';
import { SparkleFilled, DocumentPdfFilled, DocumentDataFilled, GlobePersonFilled, MailFilled, StoreMicrosoftFilled } from "@fluentui/react-icons";
import styles from "./Content.module.css";
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

export interface IButtonExampleProps {
    disabled?: boolean;
    checked?: boolean;
}

const Content = () => {
    const { t } = useTranslation(); // Initialize useTranslation hook
    const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[] | undefined>(undefined);
    const [selectedApproach, setSelectedApproach] = useState<number | undefined>(undefined);

    const onSelectedKeyChanged = (selectedFolder: string[]) => {
        setSelectedKey(selectedFolder[0]);
    };

    const onSelectedTagsChanged = (selectedTags: ITag[]) => {
        setSelectedTags(selectedTags.map((tag) => tag.name));
    }

    const onSelectedApproach = (approach: number) => {
        setSelectedApproach(approach);
        alert(approach)
    }

    const handleLinkClick = (item?: PivotItem) => {
        setSelectedKey(undefined);
    };

    return (
        <div className={styles.contentArea} >
            <Pivot aria-label={t('uploadFilesSection')} className={styles.topPivot} onLinkClick={handleLinkClick}>
                <PivotItem headerText={t('uploadFiles')} aria-label={t('uploadFilesTab')}>
                    <div className={styles.App} >
                        <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                            <SparkleFilled fontSize={"60px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label={t('supportedFileTypes')} />
                            <h1 className={styles.EmptyStateTitle}>{t('supportedFileTypes')}</h1>
                            <span className={styles.EmptyObjectives}>
                                {t('informationAssistantAgentTemplate')}
                            </span>
                            <span className={styles.EmptyObjectivesList}>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <DocumentDataFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label={t('data')} />
                                    <span className={styles.EmptyObjectivesListItemText}><b>{t('data')}</b><br />
                                        xml, json, csv, tsv, txt
                                    </span>
                                </span>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <StoreMicrosoftFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label={t('productivitySoftware')} />
                                    <span className={styles.EmptyObjectivesListItemText}><b>{t('productivitySoftware')}</b><br />
                                        pptx, docx & xlsx
                                    </span>
                                </span>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <DocumentPdfFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label={t('pdf')} />
                                    <span className={styles.EmptyObjectivesListItemText}><b>{t('pdf')}</b><br />
                                        {t('pageCountMaximum')} <a href="https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/concept-layout?view=doc-intel-4.0.0#input-requirements">
                                            {t('here')}</a>
                                    </span>
                                </span>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <GlobePersonFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label={t('web')} />
                                    <span className={styles.EmptyObjectivesListItemText}><b>{t('web')}</b><br />
                                        htm & html
                                    </span>
                                </span>
                                <span className={styles.EmptyObjectivesListItem}>
                                    <MailFilled fontSize={"40px"} primaryFill={"rgba(115, 118, 225, 1)"} aria-hidden="true" aria-label={t('email')} />
                                    <span className={styles.EmptyObjectivesListItemText}><b>{t('email')}</b><br />
                                        eml & msg
                                    </span>
                                </span>
                            </span>
                        </div>
                        <div className={styles.EmptyObjectivesListItem}>
                            <FolderPicker allowFolderCreation={true} onSelectedKeyChange={onSelectedKeyChanged} />
                            <TagPickerInline allowNewTags={true} onSelectedTagsChange={onSelectedTagsChanged} />
                            <FilePicker folderPath={selectedKey || ""} tags={selectedTags || []} />
                        </div>
                    </div>
                </PivotItem>
                <PivotItem headerText={t('uploadStatus')} aria-label={t('uploadStatusTab')}>
                    <FileStatus className="" />
                </PivotItem>
            </Pivot>
        </div>
    );
};

export default Content;