// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Button, ButtonGroup } from "react-bootstrap";
import { ChatMode, GetFeatureFlagsResponse } from "../../api";
import { useTranslation } from 'react-i18next';
import styles from "./ChatModeButtonGroup.module.css";

interface Props {
    className?: string;
    featureFlags?: GetFeatureFlagsResponse;
    onClick: (_ev: any) => void;
    defaultValue?: ChatMode;
}

export const ChatModeButtonGroup = ({ className, onClick, defaultValue, featureFlags }: Props) => {
    const { t } = useTranslation();

    return (
        <div className={`${styles.container} ${className ?? ""}`}>
            {// The WorkOnly button is always enabled, but WorkPlusWeb and Ungrounded are conditionally enabled based on feature flags
                // If both WorkPlusWeb and Ungrounded are enabled, show all three buttons
                featureFlags?.ENABLE_WEB_CHAT && featureFlags?.ENABLE_UNGROUNDED_CHAT ?
                    <ButtonGroup className={`${styles.buttonGroup}`} onClick={onClick} bsPrefix="ia">
                        <Button className={`${defaultValue == ChatMode.WorkOnly ? styles.buttonleftactive : styles.buttonleft ?? ""}`} size="sm" value={0} bsPrefix='ia'>{t('chatMode.workOnly')}</Button>
                        <Button className={`${defaultValue == ChatMode.WorkPlusWeb ? styles.buttonmiddleactive : styles.buttonmiddle ?? ""}`} size="sm" value={1} bsPrefix='ia'>{t('chatMode.workPlusWeb')}</Button>
                        <Button className={`${defaultValue == ChatMode.Ungrounded ? styles.buttonrightactive : styles.buttonright ?? ""}`} size="sm" value={2} bsPrefix='ia'>{t('chatMode.ungrounded')}</Button>
                    </ButtonGroup>
                    : // If only WorkPlusWeb is enabled, show only WorkPlusWeb and WorkOnly buttons
                    featureFlags?.ENABLE_WEB_CHAT && !featureFlags?.ENABLE_UNGROUNDED_CHAT ?
                        <ButtonGroup className={`${styles.buttonGroup}`} onClick={onClick} bsPrefix="ia">
                            <Button className={`${defaultValue == ChatMode.WorkOnly ? styles.buttonleftactive : styles.buttonleft ?? ""}`} size="sm" value={0} bsPrefix='ia'>{t('chatMode.workOnly')}</Button>
                            <Button className={`${defaultValue == ChatMode.WorkPlusWeb ? styles.buttonrightactive : styles.buttonright ?? ""}`} size="sm" value={1} bsPrefix='ia'>{t('chatMode.workPlusWeb')}</Button>
                        </ButtonGroup>
                        : // If only Ungrounded is enabled, show only Ungrounded and WorkOnly buttons
                        featureFlags?.ENABLE_UNGROUNDED_CHAT && !featureFlags?.ENABLE_WEB_CHAT ?
                            <ButtonGroup className={`${styles.buttonGroup}`} onClick={onClick} bsPrefix="ia">
                                <Button className={`${defaultValue == ChatMode.WorkOnly ? styles.buttonleftactive : styles.buttonleft ?? ""}`} size="sm" value={0} bsPrefix='ia'>{t('chatMode.workOnly')}</Button>
                                <Button className={`${defaultValue == ChatMode.Ungrounded ? styles.buttonrightactive : styles.buttonright ?? ""}`} size="sm" value={2} bsPrefix='ia'>{t('chatMode.ungrounded')}</Button>
                            </ButtonGroup>
                            : // If neither WorkPlusWeb nor Ungrounded are enabled, show only WorkOnly button
                            <ButtonGroup className={`${styles.buttonGroup}`} onClick={onClick} bsPrefix="ia">
                                <Button className={`${defaultValue == ChatMode.WorkOnly ? styles.buttonmiddleactive : styles.buttonmiddle ?? ""}`} size="sm" value={0} bsPrefix='ia'>{t('chatMode.workOnly')}</Button>
                            </ButtonGroup>
            }
        </div>
    );
};