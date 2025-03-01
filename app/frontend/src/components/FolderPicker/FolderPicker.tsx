// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useState, useEffect } from 'react';
import { useId, useBoolean } from '@fluentui/react-hooks';
import {
    ComboBox,
    IComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    SelectableOptionMenuItemType,
    TooltipHost,
    ITooltipHostStyles,
    ActionButton,
    DirectionalHint
} from "@fluentui/react";
import { TeachingBubble, ITeachingBubbleStyles } from '@fluentui/react/lib/TeachingBubble';
import { Info16Regular } from '@fluentui/react-icons';
import { ITextFieldStyleProps, ITextFieldStyles, TextField } from '@fluentui/react/lib/TextField';
import { ILabelStyles, ILabelStyleProps } from '@fluentui/react/lib/Label';
import { IIconProps } from '@fluentui/react';
import { IButtonProps } from '@fluentui/react/lib/Button';
import { useTranslation } from 'react-i18next';

import { getFolders } from "../../api";
import styles from "./FolderPicker.module.css";

var allowNewFolders = false;

interface Props {
    allowFolderCreation?: boolean;
    onSelectedKeyChange: (selectedFolders: string[]) => void;
    preSelectedKeys?: string[];
    hide?: boolean;
}

export const FolderPicker = ({ allowFolderCreation, onSelectedKeyChange, preSelectedKeys, hide }: Props) => {

    const { t } = useTranslation();

    const buttonId = useId('targetButton');
    const tooltipId = useId('folderpicker-tooltip');
    const textFieldId = useId('textField');

    const [teachingBubbleVisible, { toggle: toggleTeachingBubbleVisible }] = useBoolean(false);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [options, setOptions] = useState<IComboBoxOption[]>([]);
    const selectableOptions = options.filter(
        option =>
            (option.itemType === SelectableOptionMenuItemType.Normal || option.itemType === undefined) && !option.disabled,
    );
    const comboBoxStyles: Partial<IComboBoxStyles> = { root: { maxWidth: 300 } };
    const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block' } };
    const addFolderIcon: IIconProps = { iconName: 'Add' };

    allowNewFolders = allowFolderCreation as boolean;

    const teachingBubbleStyles: Partial<ITeachingBubbleStyles> = {
        content: {
            background: "#d3d3d3",
            borderColor: "#696969"
        },
        headline: {
            color: "#696969"
        },
    }

    const teachingBubblePrimaryButtonClick = () => {
        const textField = document.getElementById(textFieldId) as HTMLInputElement;
        if (!textField.defaultValue || textField.defaultValue.trim() === '') {
            alert('Please enter a folder name.');
        } else {
            // add the folder to the dropdown list and select it
            // This will be passed to the file-picker component to determine the folder to upload to
            const trimVal = textField.defaultValue.trim()
            const currentOptions = options;
            currentOptions.push({ key: trimVal, text: trimVal });
            setOptions(currentOptions);
            setSelectedKeys([trimVal]);
            onSelectedKeyChange([trimVal]);
            toggleTeachingBubbleVisible();
        }
    };

    const examplePrimaryButtonProps: IButtonProps = {
        children: t('createNewFolder'),
        onClick: teachingBubblePrimaryButtonClick,
    };

    async function fetchBlobFolderData() {
        try {
            const newOptions: IComboBoxOption[] = allowNewFolders ? [] : [
                { key: 'selectAll', text: 'Select All', itemType: SelectableOptionMenuItemType.SelectAll },
                { key: 'FolderHeader', text: 'Folders', itemType: SelectableOptionMenuItemType.Header }];
            const folders = await getFolders();
            newOptions.push(...folders.map((folder: string) => ({ key: folder, text: folder })));
            setOptions(newOptions);
            if (!allowNewFolders) {
                var filteredOptions = newOptions.filter(
                    option =>
                        (option.itemType === SelectableOptionMenuItemType.Normal || option.itemType === undefined) && !option.disabled,
                );
                if (preSelectedKeys !== undefined && preSelectedKeys.length > 0) {
                    setSelectedKeys(preSelectedKeys);
                    onSelectedKeyChange(preSelectedKeys);
                }
                else {
                    setSelectedKeys(['selectAll', ...filteredOptions.map(o => o.key as string)]);
                    onSelectedKeyChange(['selectAll', ...filteredOptions.map(o => o.key as string)]);
                }
            }
        } catch (error) {
            // Handle the error here
            console.log(error);
        }
    }

    useEffect(() => {
        fetchBlobFolderData();
    }, []);

    function getStyles(props: ITextFieldStyleProps): Partial<ITextFieldStyles> {
        const { required } = props;
        return {
            fieldGroup: [
                { width: 300 },
                required && {
                    borderColor: "#F8f8ff",
                },
            ],
            subComponentStyles: {
                label: getLabelStyles,
            },
        };
    }

    function getLabelStyles(props: ILabelStyleProps): ILabelStyles {
        const { required } = props;
        return {
            root: required && {
                color: "#696969",
            },
        };
    }

    const onChange = (
        event: React.FormEvent<IComboBox>,
        option?: IComboBoxOption,
        index?: number,
        value?: string,
    ): void => {
        const selected = option?.selected;
        const currentSelectedOptionKeys = selectedKeys.filter(key => key !== 'selectAll');
        const selectAllState = currentSelectedOptionKeys.length === selectableOptions.length;
        if (!allowNewFolders) {
            if (option) {
                if (option?.itemType === SelectableOptionMenuItemType.SelectAll) {
                    if (selectAllState) {
                        setSelectedKeys([])
                        onSelectedKeyChange([]);
                    }
                    else {
                        setSelectedKeys(['selectAll', ...selectableOptions.map(o => o.key as string)]);
                        onSelectedKeyChange(['selectAll', ...selectableOptions.map(o => o.key as string)]);
                    }
                } else {
                    const updatedKeys = selected
                        ? [...currentSelectedOptionKeys, option!.key as string]
                        : currentSelectedOptionKeys.filter(k => k !== option.key);
                    if (updatedKeys.length === selectableOptions.length) {
                        updatedKeys.push('selectAll');
                    }
                    setSelectedKeys(updatedKeys);
                    onSelectedKeyChange(updatedKeys);
                }
            }
        }
        else {
            setSelectedKeys([option!.key as string]);
            onSelectedKeyChange([option!.key as string]);
        }
    };

    return (
        <div className={hide ? styles.hide : styles.folderArea}>
            <div className={styles.folderSelection}>
                <ComboBox
                    multiSelect={allowNewFolders ? false : true}
                    selectedKey={selectedKeys}
                    label={allowNewFolders ? t('folderSelection') : t('folderSelectionMultiple')}
                    options={options}
                    onChange={onChange}
                    styles={comboBoxStyles}
                />
                <TooltipHost content={allowNewFolders ? t('selectFolderToUpload') : t('selectFolderToFilter')}
                    styles={hostStyles}
                    id={tooltipId}>
                    <Info16Regular></Info16Regular>
                </TooltipHost>
            </div>
            {allowNewFolders ? (
                <div className={styles.actionButton}>
                    <ActionButton
                        iconProps={addFolderIcon}
                        allowDisabledFocus
                        onClick={toggleTeachingBubbleVisible}
                        id={buttonId}>
                        {t('createNewFolder')}
                    </ActionButton>
                    {teachingBubbleVisible && (
                        <TeachingBubble
                            target={`#${buttonId}`}
                            primaryButtonProps={examplePrimaryButtonProps}
                            onDismiss={toggleTeachingBubbleVisible}
                            headline={t('createNewFolder')}
                            calloutProps={{ directionalHint: DirectionalHint.topCenter }}
                            styles={teachingBubbleStyles}
                            hasCloseButton={true}
                        >
                            <TextField id={textFieldId} label={t('folderName')} required={true} styles={getStyles} />
                        </TeachingBubble>
                    )}
                </div>) : ""}
        </div>
    );
};