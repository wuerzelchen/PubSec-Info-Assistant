// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Button, ButtonGroup } from "react-bootstrap";
import { Label } from "@fluentui/react";
import { useTranslation } from 'react-i18next';

import styles from "./ResponseLengthButtonGroup.module.css";

interface Props {
    className?: string;
    onClick: (_ev: any) => void;
    defaultValue?: number;
}

export const ResponseLengthButtonGroup = ({ className, onClick, defaultValue }: Props) => {
    const { t } = useTranslation();
    return (
        <div className={`${styles.container} ${className ?? ""}`}>
            <Label>{t('responseLength')}:</Label>
            <ButtonGroup className={`${styles.buttongroup ?? ""}`} onClick={onClick}>
                <Button id="Succinct" className={`${defaultValue == 1024 ? styles.buttonleftactive : styles.buttonleft ?? ""}`} size="sm" value={1024} bsPrefix='ia'>{t('succinct')}</Button>
                <Button id="Standard" className={`${defaultValue == 2048 ? styles.buttonmiddleactive : styles.buttonmiddle ?? ""}`} size="sm" value={2048} bsPrefix='ia'>{t('standard')}</Button>
                <Button id="Thorough" className={`${defaultValue == 3072 ? styles.buttonrightactive : styles.buttonright ?? ""}`} size="sm" value={3072} bsPrefix='ia'>{t('thorough')}</Button>
            </ButtonGroup>
        </div>
    );
};
